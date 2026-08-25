"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { invalidarResumoDeParticipantesComMissao } from "@/lib/dados/participante";

export type AdminActionState = { ok: true } | { ok: false; erro: string };

const TIPOS_CRITERIO = ["SESSAO_DIRETA", "STANDS_POR_DIA", "PRESENCA_DIARIA_STREAK", "PALESTRAS_TOTAL"] as const;

const missaoSchema = z.object({
  titulo: z.string().trim().min(1),
  tipoCriterio: z.enum(TIPOS_CRITERIO),
  parametro: z.coerce.number().int().min(1),
  pontosBonus: z.coerce.number().int().min(0),
  idSessao: z.string().optional(),
});

/**
 * `idSessao` só faz sentido para SESSAO_DIRETA — para os demais critérios é
 * sempre nulo, mesmo que o form envie algo (o campo fica escondido no
 * cliente, mas não custa validar de novo aqui).
 */
function extrairDadosMissao(formData: FormData) {
  const parsed = missaoSchema.safeParse({
    titulo: formData.get("titulo"),
    tipoCriterio: formData.get("tipoCriterio"),
    parametro: formData.get("parametro"),
    pontosBonus: formData.get("pontosBonus"),
    idSessao: formData.get("idSessao") || undefined,
  });
  if (!parsed.success) return null;

  const { idSessao, ...resto } = parsed.data;

  if (resto.tipoCriterio === "SESSAO_DIRETA") {
    const idSessaoNum = idSessao ? Number(idSessao) : NaN;
    if (!Number.isInteger(idSessaoNum)) return null;
    return { ...resto, idSessao: idSessaoNum };
  }

  return { ...resto, idSessao: null };
}

export async function criarMissaoAction(
  _prevState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const dados = extrairDadosMissao(formData);
  if (!dados) {
    return { ok: false, erro: "Preencha todos os campos. Missões de check-in direto exigem uma sessão." };
  }

  await prisma.missao.create({ data: dados });

  revalidateTag("catalogo", "max");
  redirect("/admin/missoes");
}

export async function atualizarMissaoAction(
  id: number,
  _prevState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const dados = extrairDadosMissao(formData);
  if (!dados) {
    return { ok: false, erro: "Preencha todos os campos. Missões de check-in direto exigem uma sessão." };
  }

  await prisma.missao.update({ where: { id }, data: dados });

  // titulo/pontosBonus mudaram: todo participante que já desbloqueou essa
  // missão está com o resumo cacheado desatualizado.
  await invalidarResumoDeParticipantesComMissao(id);

  revalidateTag("catalogo", "max");
  redirect("/admin/missoes");
}

export async function excluirMissaoAction(id: number): Promise<void> {
  await requireAdmin();

  // Busca os desbloqueios (e invalida o resumo de quem os tem) ANTES do
  // delete — depois de apagar a Missao não dá mais pra saber quem tinha
  // desbloqueado (a FK em MissaoDesbloqueada some junto).
  await invalidarResumoDeParticipantesComMissao(id);

  await prisma.missao.delete({ where: { id } });
  revalidateTag("catalogo", "max");
  redirect("/admin/missoes");
}
