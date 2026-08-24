"use server";

import { createId } from "@paralleldrive/cuid2";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export type AdminActionState = { ok: true } | { ok: false; erro: string };

const sessaoSchema = z.object({
  nome: z.string().trim().min(1),
  tipo: z.enum(["ESTANDE", "PALESTRA"]),
  pontosBase: z.coerce.number().int().min(0),
  dia: z.coerce.date().optional().nullable(),
  horario: z.string().trim().min(1).max(20).optional().nullable(),
  local: z.string().trim().min(1).max(255).optional().nullable(),
});

function parseCamposAgenda(formData: FormData) {
  const dia = formData.get("dia");
  const horario = formData.get("horario");
  const local = formData.get("local");
  return {
    dia: dia ? dia : null,
    horario: horario ? horario : null,
    local: local ? local : null,
  };
}

export async function criarSessaoAction(
  _prevState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = sessaoSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    pontosBase: formData.get("pontosBase"),
    ...parseCamposAgenda(formData),
  });
  if (!parsed.success) {
    return { ok: false, erro: "Preencha nome, tipo e pontos base corretamente." };
  }

  // qr_code sempre gerado pelo servidor via cuid() — nunca sequencial, nunca
  // vindo de input do admin.
  await prisma.sessao.create({ data: { ...parsed.data, qrCode: createId() } });

  revalidateTag("catalogo", "max");
  redirect("/admin/sessoes");
}

export async function atualizarSessaoAction(
  id: number,
  _prevState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = sessaoSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    pontosBase: formData.get("pontosBase"),
    ...parseCamposAgenda(formData),
  });
  if (!parsed.success) {
    return { ok: false, erro: "Preencha nome, tipo e pontos base corretamente." };
  }

  await prisma.sessao.update({ where: { id }, data: parsed.data });

  revalidateTag("catalogo", "max");
  redirect("/admin/sessoes");
}

export async function excluirSessaoAction(id: number): Promise<void> {
  await requireAdmin();
  await prisma.sessao.delete({ where: { id } });
  revalidateTag("catalogo", "max");
  redirect("/admin/sessoes");
}
