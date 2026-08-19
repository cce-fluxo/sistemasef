import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MissaoForm } from "@/components/admin/MissaoForm";
import { atualizarMissaoAction } from "@/actions/admin/missoes";

export const metadata: Metadata = { title: "Editar missão — Admin" };

export default async function EditarMissaoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [missao, sessoes] = await Promise.all([
    prisma.missao.findUnique({ where: { id: Number(id) } }),
    prisma.sessao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);
  if (!missao) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Editar missão</h1>
      <div className="mt-6">
        <MissaoForm
          action={atualizarMissaoAction.bind(null, missao.id)}
          sessoes={sessoes}
          valoresIniciais={{
            titulo: missao.titulo,
            tipoCriterio: missao.tipoCriterio,
            parametro: missao.parametro,
            pontosBonus: missao.pontosBonus,
            idSessao: missao.idSessao,
          }}
        />
      </div>
    </div>
  );
}
