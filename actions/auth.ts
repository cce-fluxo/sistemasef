"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSession, sessionCookieOptions, SESSION_COOKIE, type Role } from "@/lib/auth/session";
import { expiraEm, gerarToken, hashToken, urlRedefinicao } from "@/lib/auth/recuperacao";
import { enviarEmail } from "@/lib/email/enviar";
import { emailRecuperacaoSenha } from "@/lib/email/templates";
import { getRatelimiter } from "@/lib/ratelimit";

export type AuthActionState = { ok: true } | { ok: false; erro: string };

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

const registerSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
});

// Login/cadastro ainda não têm id_participante, então o rate limit é por IP
// (o check-in, que já tem sessão, limita por id_participante — ver actions/checkin.ts).
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function createSessionCookie(id: number, role: Role) {
  const token = await signSession({ id, role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function loginAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erro: "Informe um e-mail válido e a senha." };
  }

  const { success: allowed } = await getRatelimiter("auth-login").limit(await clientIp());
  if (!allowed) {
    return { ok: false, erro: "Muitas tentativas. Tente novamente em instantes." };
  }

  const participante = await prisma.participante.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, hashSenha: true, role: true },
  });
  if (!participante) {
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }

  const senhaValida = await verifyPassword(parsed.data.senha, participante.hashSenha);
  if (!senhaValida) {
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }

  await createSessionCookie(participante.id, participante.role);
  redirect("/");
}

export async function registerAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erro: "Preencha nome, e-mail e uma senha com no mínimo 8 caracteres." };
  }

  const { success: allowed } = await getRatelimiter("auth-register").limit(await clientIp());
  if (!allowed) {
    return { ok: false, erro: "Muitas tentativas. Tente novamente em instantes." };
  }

  const existente = await prisma.participante.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existente) {
    return { ok: false, erro: "Já existe uma conta com este e-mail." };
  }

  const hashSenha = await hashPassword(parsed.data.senha);
  const participante = await prisma.participante.create({
    data: { nome: parsed.data.nome, email: parsed.data.email, hashSenha, role: "PARTICIPANTE" },
    select: { id: true, role: true },
  });

  await createSessionCookie(participante.id, participante.role);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

const recuperacaoSchema = z.object({ email: z.string().email() });

/**
 * Pedido de recuperação de senha. Responde SEMPRE `{ ok: true }`, exista a
 * conta ou não: qualquer diferença de resposta (mensagem, status ou tempo)
 * transforma esta rota num verificador de "quem está cadastrado no evento".
 * Erro de envio também é engolido para o usuário e só vai para o log.
 */
export async function solicitarRecuperacaoAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = recuperacaoSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, erro: "Informe um e-mail válido." };
  }

  // Limite apertado (3 a cada 15 min por IP): sem sessão, o único custo de
  // pedir reset em massa seria nosso — banco, cota de SMTP e reputação do
  // remetente.
  const { success: allowed } = await getRatelimiter("auth-recuperar", 3, 900).limit(await clientIp());
  if (!allowed) {
    return { ok: false, erro: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  try {
    const participante = await prisma.participante.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, nome: true, email: true },
    });

    if (participante) {
      // Invalida pedidos anteriores ainda válidos: o último link pedido é o
      // único que funciona.
      await prisma.tokenRecuperacaoSenha.updateMany({
        where: { idParticipante: participante.id, usadoEm: null },
        data: { usadoEm: new Date() },
      });

      const { token, hash } = gerarToken();
      await prisma.tokenRecuperacaoSenha.create({
        data: { idParticipante: participante.id, hashToken: hash, expiraEm: expiraEm() },
      });

      const conteudo = emailRecuperacaoSenha(participante.nome, urlRedefinicao(token));
      await enviarEmail({ para: participante.email, ...conteudo });
    }
  } catch (error) {
    console.error("solicitarRecuperacaoAction falhou:", error);
  }

  return { ok: true };
}

const redefinicaoSchema = z
  .object({
    token: z.string().min(1),
    senha: z.string().min(8),
    confirmacao: z.string().min(1),
  })
  .refine((dados) => dados.senha === dados.confirmacao, { path: ["confirmacao"] });

export async function redefinirSenhaAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = redefinicaoSchema.safeParse({
    token: formData.get("token"),
    senha: formData.get("senha"),
    confirmacao: formData.get("confirmacao"),
  });
  if (!parsed.success) {
    return { ok: false, erro: "As senhas precisam ser iguais e ter no mínimo 8 caracteres." };
  }

  const { success: allowed } = await getRatelimiter("auth-redefinir", 5, 900).limit(await clientIp());
  if (!allowed) {
    return { ok: false, erro: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const registro = await prisma.tokenRecuperacaoSenha.findUnique({
    where: { hashToken: hashToken(parsed.data.token) },
    select: { id: true, idParticipante: true, expiraEm: true, usadoEm: true },
  });

  // Mesma mensagem para token inexistente, já usado e expirado — quem tem o
  // link certo não precisa da distinção, e quem está tentando adivinhar não
  // merece a pista.
  if (!registro || registro.usadoEm !== null || registro.expiraEm.getTime() < Date.now()) {
    return { ok: false, erro: "Este link expirou ou já foi usado. Peça um novo em 'Esqueci minha senha'." };
  }

  const hashSenha = await hashPassword(parsed.data.senha);

  // Uso único garantido pelo `usadoEm: null` no WHERE do update: se duas
  // requisições chegarem juntas, só a primeira encontra o registro e a
  // transação da segunda não altera nada.
  const consumido = await prisma.tokenRecuperacaoSenha.updateMany({
    where: { id: registro.id, usadoEm: null },
    data: { usadoEm: new Date() },
  });
  if (consumido.count === 0) {
    return { ok: false, erro: "Este link expirou ou já foi usado. Peça um novo em 'Esqueci minha senha'." };
  }

  await prisma.participante.update({
    where: { id: registro.idParticipante },
    data: { hashSenha },
  });

  // Trocar a senha derruba a sessão atual deste navegador. As sessões já
  // emitidas em outros dispositivos seguem válidas até expirar (2h), porque
  // o JWT é stateless — se isso virar requisito, é preciso versionar o token.
  const store = await cookies();
  store.delete(SESSION_COOKIE);

  redirect("/login?senha-redefinida=1");
}
