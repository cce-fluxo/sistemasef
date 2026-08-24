import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { excluirSessaoAction } from "@/actions/admin/sessoes";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const metadata: Metadata = { title: "Sessões — Admin" };

export default async function AdminSessoesPage() {
  await requireAdmin();
  const sessoes = await prisma.sessao.findMany({ orderBy: { id: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Sessões</h1>
        <Link
          href="/admin/sessoes/nova"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Nova sessão
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {sessoes.map((sessao) => (
          <div
            key={sessao.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-surface p-4 dark:border-white/5"
          >
            <div>
              <p className="font-medium text-foreground">{sessao.nome}</p>
              <p className="text-sm text-foreground/60">
                {sessao.tipo === "ESTANDE" ? "Estande" : "Palestra"} · {sessao.pontosBase} pts
                {sessao.dia && ` · ${sessao.dia.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}
                {sessao.horario && ` · ${sessao.horario}`}
                {sessao.local && ` · ${sessao.local}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/api/sessoes/${sessao.id}/qrcode`}
                className="text-sm font-medium text-brand-500 hover:underline"
              >
                Baixar QR
              </Link>
              <Link
                href={`/admin/sessoes/${sessao.id}/editar`}
                className="text-sm font-medium text-foreground/60 hover:text-brand-500"
              >
                Editar
              </Link>
              <form action={excluirSessaoAction.bind(null, sessao.id)}>
                <ConfirmSubmitButton mensagem={`Excluir "${sessao.nome}"? Isso remove também as presenças registradas nela.`}>
                  Excluir
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {sessoes.length === 0 && <p className="text-sm text-foreground/60">Nenhuma sessão cadastrada ainda.</p>}
      </div>
    </div>
  );
}
