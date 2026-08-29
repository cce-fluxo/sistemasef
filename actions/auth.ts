"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSession, sessionCookieOptions, SESSION_COOKIE, type Role } from "@/lib/auth/session";
import { getRatelimiter } from "@/lib/ratelimit";
import { isEmailInscrito } from "@/lib/redis-inscritos";

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

  // Só permite cadastro de quem está na lista oficial de inscritos da Semana
  // Fluxo. Consulta apenas o cache no Redis (SISMEMBER) — a leitura da
  // planilha fica isolada no cron /api/cron/refresh-inscritos.
  if (!(await isEmailInscrito(parsed.data.email))) {
    return { ok: false, erro: "Email não inscrito na Semana Fluxo, insira um válido" };
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
