"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { hashPassword } from "@/lib/auth/password";

export type AdminActionState = { ok: true } | { ok: false; erro: string };

const novoAdminSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
});

export async function criarAdministradorAction(
  _prevState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = novoAdminSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erro: "Preencha nome, e-mail e uma senha com no mínimo 8 caracteres." };
  }

  const existente = await prisma.participante.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existente) {
    return { ok: false, erro: "Já existe uma conta com este e-mail." };
  }

  const hashSenha = await hashPassword(parsed.data.senha);
  await prisma.participante.create({
    data: { nome: parsed.data.nome, email: parsed.data.email, hashSenha, role: "ADMIN" },
  });

  redirect("/admin");
}
