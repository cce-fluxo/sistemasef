import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Presenças — Admin" };

function formatarDia(dia: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(
    dia,
  );
}

const campoClasse =
  "rounded-xl border border-black/10 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10";

export default async function AdminPresencasPage({
  searchParams,
}: {
  searchParams: Promise<{ sessaoId?: string; dia?: string }>;
}) {
  await requireAdmin();
  const { sessaoId, dia } = await searchParams;

  const [presencas, sessoes] = await Promise.all([
    prisma.presenca.findMany({
      where: {
        ...(sessaoId ? { idSessao: Number(sessaoId) } : {}),
        ...(dia ? { registradoEm: new Date(`${dia}T00:00:00.000Z`) } : {}),
      },
      orderBy: { registradoEm: "desc" },
      include: { participante: { select: { nome: true } }, sessao: { select: { nome: true } } },
      take: 200,
    }),
    prisma.sessao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Presenças</h1>

      <form className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="sessaoId" className="text-xs font-medium text-foreground/60">
            Sessão
          </label>
          <select id="sessaoId" name="sessaoId" defaultValue={sessaoId ?? ""} className={campoClasse}>
            <option value="">Todas</option>
            {sessoes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dia" className="text-xs font-medium text-foreground/60">
            Dia
          </label>
          <input id="dia" type="date" name="dia" defaultValue={dia ?? ""} className={campoClasse} />
        </div>
        <button type="submit" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          Filtrar
        </button>
        {(sessaoId || dia) && (
          <a href="/admin/presencas" className="text-sm font-medium text-foreground/60 hover:text-brand-500">
            Limpar filtros
          </a>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-black/5 dark:border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2 font-medium">Participante</th>
              <th className="px-4 py-2 font-medium">Sessão</th>
              <th className="px-4 py-2 font-medium">Dia</th>
            </tr>
          </thead>
          <tbody>
            {presencas.map((p) => (
              <tr key={p.id} className="border-t border-black/5 dark:border-white/5">
                <td className="px-4 py-2 text-foreground">{p.participante.nome}</td>
                <td className="px-4 py-2 text-foreground/70">{p.sessao.nome}</td>
                <td className="px-4 py-2 text-foreground/70">{formatarDia(p.registradoEm)}</td>
              </tr>
            ))}
            {presencas.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-foreground/50">
                  Nenhuma presença encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
