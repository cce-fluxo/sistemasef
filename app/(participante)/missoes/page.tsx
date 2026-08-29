import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getMissoesComStatus } from "@/lib/dados/missoes";

export const metadata: Metadata = {
  title: "Missões — Evento Gamificado",
};

function QrIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden>
      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 19h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
    </svg>
  );
}

export default async function MissoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const missoes = await getMissoesComStatus(session.id);
  const completas = missoes.filter((m) => m.completa);
  const pontosCompletas = completas.reduce((soma, m) => soma + m.pontosBonus, 0);

  return (
    <div>
      <header className="header-gradient-green px-5 pt-12 pb-7 text-white">
        <h1 className="font-display text-4xl leading-none uppercase">Missões</h1>
        <p className="mt-1.5 text-sm text-white/80">Complete missões e acumule pontos!</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/25 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold tracking-wider uppercase text-white/70">Pontuação</p>
            <p className="mt-0.5 font-display text-[28px] leading-tight text-gold-400">{pontosCompletas}</p>
          </div>
          <div className="rounded-xl bg-black/25 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold tracking-wider uppercase text-white/70">Completas</p>
            <p className="mt-0.5 font-display text-[28px] leading-tight text-gold-400">
              {completas.length}/{missoes.length}
            </p>
          </div>
        </div>
      </header>

      <main className="px-5 py-6">
        <Link
          href="/scan"
          className="relative mb-5 flex items-center gap-3.5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-4 text-white"
        >
          <span className="stripes absolute inset-0" aria-hidden />
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/25">
            <QrIcon />
          </span>
          <span className="relative">
            <span className="block font-heading text-lg font-bold uppercase">Escanear QR Code</span>
            <span className="block text-[13px] text-white/80">Registre presença e ganhe pontos!</span>
          </span>
          <span className="relative ml-auto text-xl">→</span>
        </Link>

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {missoes.map((missao) => (
            <div
              key={missao.id}
              className={`mission-card flex items-start gap-3.5 p-4 ${missao.completa ? "completed" : ""}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[1.5px] ${
                  missao.completa
                    ? "border-success-500 bg-success-500/30 text-success-400"
                    : "border-line bg-surface text-faint"
                }`}
              >
                {missao.completa ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22} aria-hidden>
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22} aria-hidden>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[15px] font-extrabold ${missao.completa ? "text-success-400" : "text-foreground"}`}>
                  {missao.titulo}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{missao.descricao}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-heading text-xl font-bold text-gold-400">+{missao.pontosBonus}</span>
                <span className="text-[11px] text-faint">pts</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
