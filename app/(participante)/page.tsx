import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getResumoParticipante } from "@/lib/dados/participante";
import { getCatalogoPontuacao } from "@/lib/dados/catalogo";
import { logoutAction } from "@/actions/auth";

const EXPLORAR = [
  { href: "/sobre", label: "Sobre" },
  { href: "/missoes", label: "Missões" },
  { href: "/agenda", label: "Agenda" },
  { href: "/ranking", label: "Ranking" },
];

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [participante, resumo, catalogo] = await Promise.all([
    prisma.participante.findUnique({ where: { id: session.id }, select: { nome: true } }),
    getResumoParticipante(session.id),
    getCatalogoPontuacao(),
  ]);

  const progresso =
    catalogo.pontosMaximos > 0 ? Math.min(100, Math.round((resumo.pontosTotais / catalogo.pontosMaximos) * 100)) : 0;

  return (
    <div>
      <header className="header-gradient-brand px-6 pb-8 pt-8 text-white">
        <p className="text-sm text-white/80">Olá, estudante! 👋</p>
        <h1 className="mt-1 font-display text-2xl font-bold">
          Bem-vindo{participante ? `, ${participante.nome.split(" ")[0]}` : ""}!
        </h1>

        <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Seus pontos</span>
            <span>
              {resumo.totalMissoesDesbloqueadas}/{catalogo.totalMissoes} missões
            </span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold">
            {resumo.pontosTotais}
            <span className="text-base font-normal text-white/60"> / {catalogo.pontosMaximos}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold-400" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Explorar</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {EXPLORAR.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl bg-brand-500 py-6 text-center font-display font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {resumo.ultimasMissoes.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Missões recentes</h2>
              <Link href="/missoes" className="text-sm font-medium text-brand-500 hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {resumo.ultimasMissoes.map((missao) => (
                <div
                  key={missao.titulo}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-surface p-3 dark:border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500/15 text-success-500">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-foreground">{missao.titulo}</span>
                  </div>
                  <span className="text-sm font-semibold text-gold-500">+{missao.pontosBonus}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-muted dark:border-white/10"
          >
            Sair
          </button>
        </form>
      </main>
    </div>
  );
}
