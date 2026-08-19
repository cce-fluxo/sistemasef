import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { excluirMissaoAction } from "@/actions/admin/missoes";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const metadata: Metadata = { title: "Missões — Admin" };

export default async function AdminMissoesPage() {
  await requireAdmin();
  const missoes = await prisma.missao.findMany({
    orderBy: { id: "asc" },
    include: { sessao: { select: { nome: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Missões</h1>
        <Link
          href="/admin/missoes/nova"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Nova missão
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {missoes.map((missao) => (
          <div
            key={missao.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-surface p-4 dark:border-white/5"
          >
            <div>
              <p className="font-medium text-foreground">{missao.titulo}</p>
              <p className="text-sm text-foreground/60">
                {missao.tipoCriterio} · parâmetro {missao.parametro} · +{missao.pontosBonus} pts
                {missao.sessao ? ` · ${missao.sessao.nome}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/missoes/${missao.id}/editar`}
                className="text-sm font-medium text-foreground/60 hover:text-brand-500"
              >
                Editar
              </Link>
              <form action={excluirMissaoAction.bind(null, missao.id)}>
                <ConfirmSubmitButton mensagem={`Excluir a missão "${missao.titulo}"?`}>Excluir</ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {missoes.length === 0 && <p className="text-sm text-foreground/60">Nenhuma missão cadastrada ainda.</p>}
      </div>
    </div>
  );
}
