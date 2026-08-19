import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MissaoForm } from "@/components/admin/MissaoForm";
import { criarMissaoAction } from "@/actions/admin/missoes";

export const metadata: Metadata = { title: "Nova missão — Admin" };

export default async function NovaMissaoPage() {
  await requireAdmin();
  const sessoes = await prisma.sessao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Nova missão</h1>
      <div className="mt-6">
        <MissaoForm action={criarMissaoAction} sessoes={sessoes} />
      </div>
    </div>
  );
}
