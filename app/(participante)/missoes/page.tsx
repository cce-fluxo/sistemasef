import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getMissoesComStatus } from "@/lib/dados/missoes";

export const metadata: Metadata = {
  title: "Missões — Evento Gamificado",
};

export default async function MissoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const missoes = await getMissoesComStatus(session.id);
  const completas = missoes.filter((m) => m.completa);
  const pontosCompletas = completas.reduce((soma, m) => soma + m.pontosBonus, 0);

  return (
    <div>
      <header className="header-gradient-brand px-6 pb-8 pt-8 text-white">
        <h1 className="font-display text-2xl font-bold">Missões</h1>
        <p className="mt-1 text-sm text-white/80">Complete missões e acumule pontos!</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">Pontuação</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-300">{pontosCompletas}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">Completas</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-300">
              {completas.length}/{missoes.length}
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-3 px-6 py-6">
        {missoes.map((missao) => (
          <div
            key={missao.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              missao.completa ? "border-success-500/20 bg-success-500/5" : "border-black/5 bg-surface dark:border-white/5"
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                missao.completa ? "bg-success-500 text-white" : "bg-surface-muted text-foreground/20"
              }`}
            >
              {missao.completa ? "✓" : ""}
            </span>
            <div className="flex-1">
              <p className={`font-medium ${missao.completa ? "text-success-500" : "text-foreground"}`}>
                {missao.titulo}
              </p>
              <p className="mt-0.5 text-sm text-foreground/60">{missao.descricao}</p>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold ${missao.completa ? "text-success-500" : "text-foreground/40"}`}
            >
              +{missao.pontosBonus}
              <span className="ml-0.5 text-xs font-normal">pts</span>
            </span>
          </div>
        ))}
      </main>
    </div>
  );
}
