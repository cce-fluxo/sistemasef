import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getResumoParticipante } from "@/lib/dados/participante";
import { getCatalogoPontuacao } from "@/lib/dados/catalogo";
import { logoutAction } from "@/actions/auth";
import { LogoBadge } from "@/components/LogoBadge";
import { Ticker } from "@/components/Ticker";
import { ThemeToggle } from "@/components/ThemeToggle";

const TICKER_ITEMS = ["NOSSO JEITO DE FAZER O AMANHÃ", "DDD 021", "A RUA É A NOSSA ESCOLA"];

function TrophyIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

function BusIcon({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <rect x="6" y="14" width="52" height="32" rx="4" fill="#E8521A" />
      <rect x="10" y="19" width="18" height="12" rx="2" fill="#87CEEB" />
      <rect x="34" y="19" width="18" height="12" rx="2" fill="#87CEEB" />
      <rect x="6" y="36" width="52" height="4" fill="#F5C83C" />
      <circle cx="18" cy="48" r="5" fill="#1A1A2E" />
      <circle cx="46" cy="48" r="5" fill="#1A1A2E" />
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
    { href: "/agenda", label: "Agenda", subtitle: "Programação do evento" },
    { href: "/ranking", label: "Ranking", subtitle: "Ver classificação" },
  ];

  return (
    <div>
      <header className="header-gradient-brand px-5 pt-12 pb-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">Olá, estudante! 👋</p>
            <h1 className="mt-0.5 font-heading text-[26px] leading-tight font-bold uppercase">
              Bem-vindo{participante ? `, ${participante.nome.split(" ")[0]}` : ""}!
            </h1>
          </div>
          <LogoBadge size={84} />
        </div>

        <div className="mt-5 rounded-2xl border border-white/15 bg-black/25 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-white/70">Seus pontos</p>
              <p className="mt-0.5 font-display text-4xl leading-none text-gold-400">
                {resumo.pontosTotais}
                <span className="font-heading text-base text-white/50"> / {catalogo.pontosMaximos}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <TrophyIcon className="ml-auto h-10 w-10 text-gold-400" />
              <p className="mt-1 text-xs font-bold text-white/70">
                {resumo.totalMissoesDesbloqueadas}/{catalogo.totalMissoes} missões
              </p>
            </div>
          </div>
          <div className="progress-bar mt-2.5">
            <div className="progress-fill" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </header>

      <Ticker items={TICKER_ITEMS} bgClassName="bg-success-500" textClassName="text-gold-400" />

      <main className="px-5 py-6">
        <h2 className="font-heading text-base font-bold tracking-[0.1em] uppercase text-muted">Explorar</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {EXPLORAR.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card card-hover min-w-0 overflow-hidden border-t-[3px] border-t-brand-500 bg-[var(--grid-card-bg)] px-3 py-4 text-center text-[var(--grid-card-text)]"
            >
              <p className="truncate font-heading text-[clamp(24px,5.25vw,48px)] leading-tight font-bold uppercase">
                {item.label}
              </p>
              <p className="mt-1 truncate text-[clamp(10px,1.5vw,12px)] opacity-70">{item.subtitle}</p>
            </Link>
          ))}
        </div>

        {session.role === "ADMIN" && (
          <Link href="/admin" className="btn-primary mt-6 block text-center">
            Ir para Home Admin
          </Link>
        )}

        {resumo.ultimasMissoes.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold tracking-[0.1em] uppercase text-muted">
                Missões recentes
              </h2>
              <Link href="/missoes" className="text-[13px] font-extrabold text-brand-500 hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {resumo.ultimasMissoes.map((missao) => (
                <div key={missao.titulo} className="mission-card completed flex items-start gap-3.5 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-success-500/30 text-success-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} aria-hidden>
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <p className="min-w-0 flex-1 truncate pt-1.5 text-sm font-extrabold text-success-400">
                    {missao.titulo}
                  </p>
                  <span className="shrink-0 pt-1.5 font-heading text-base font-bold text-gold-400">
                    +{missao.pontosBonus}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Elemento urbano do protótipo — assinatura visual da Semana Fluxo. */}
        <div className="mt-8 flex items-end justify-center gap-4">
          <BusIcon size={48} />
          <p className="font-heading text-xs leading-[1.8] tracking-[0.1em] uppercase text-faint">
            A rua é
            <br />a nossa escola
          </p>
          <BusIcon size={36} />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-4">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface-hover"
            >
              Sair
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
