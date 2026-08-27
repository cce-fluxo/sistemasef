import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getResumoParticipante } from "@/lib/dados/participante";
import { getCatalogoPontuacao } from "@/lib/dados/catalogo";
import { logoutAction } from "@/actions/auth";
import { LogoBadge } from "@/components/LogoBadge";
import { Ticker } from "@/components/Ticker";

const TICKER_ITEMS = ["NOSSO JEITO DE FAZER O AMANHÃ", "DDD 021", "A RUA É A NOSSA ESCOLA"];

function TrophyIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

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

  const EXPLORAR = [
    { href: "/sobre", label: "Sobre", subtitle: "A nossa história" },
    { href: "/missoes", label: "Missões", subtitle: `${resumo.totalMissoesDesbloqueadas}/${catalogo.totalMissoes} completas` },
    { href: "/agenda", label: "Agenda", subtitle: "5 dias de evento" },
    { href: "/ranking", label: "Ranking", subtitle: "Ver classificação" },
  ];

  return (
    <div>
      <header className="header-gradient-brand px-6 pb-8 pt-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/80">Olá, estudante! 👋</p>
            <h1 className="mt-1 font-display text-2xl font-bold">
              Bem-vindo{participante ? `, ${participante.nome.split(" ")[0]}` : ""}!
            </h1>
          </div>
          <LogoBadge size={56} />
        </div>

        <div className="mt-5 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Seus pontos</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold-400">
                {resumo.pontosTotais}
                <span className="text-base font-normal text-white/50"> / {catalogo.pontosMaximos}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <TrophyIcon className="ml-auto h-8 w-8 text-gold-400" />
              <p className="mt-1 text-xs font-semibold text-white/70">
                {resumo.totalMissoesDesbloqueadas}/{catalogo.totalMissoes} missões
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold-400" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </header>

      <Ticker items={TICKER_ITEMS} bgClassName="bg-[#2D8B4E]" textClassName="text-[#F5C83C]" />

      <main className="px-6 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Explorar</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {EXPLORAR.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border-t-4 border-brand-500 bg-surface p-4 text-center shadow-sm transition hover:bg-surface-muted"
            >
              <p className="font-display text-lg font-bold uppercase text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-foreground/50">{item.subtitle}</p>
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
