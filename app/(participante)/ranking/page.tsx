import type { Metadata } from "next";
import { getSession } from "@/lib/auth/get-session";
import { getRankingAtual } from "@/lib/dados/ranking";

export const metadata: Metadata = {
  title: "Ranking — Evento Gamificado",
};

function formatarDia(dia: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(
    dia,
  );
}

export default async function RankingPage() {
  const session = await getSession();
  const ranking = await getRankingAtual();

  return (
    <div>
      <header className="header-gradient-gold px-6 pb-6 pt-8 text-navy-950">
        <h1 className="font-display text-2xl font-bold">Ranking</h1>
        <p className="mt-1 text-sm text-navy-950/70">
          {ranking.dia
            ? `Ranking atualizado até ${formatarDia(ranking.dia)}`
            : "Ranking ainda não gerado — o primeiro snapshot sai depois da primeira noite do evento."}
        </p>
      </header>

      <main className="flex flex-col gap-2 px-6 py-6">
        {ranking.linhas.length === 0 && (
          <p className="text-center text-sm text-foreground/60">Nenhum snapshot de ranking disponível ainda.</p>
        )}

        {ranking.linhas.map((linha) => {
          const souEu = session?.id === linha.idParticipante;
          return (
            <div
              key={linha.idParticipante}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                souEu ? "border-brand-500 bg-brand-500/10" : "border-black/5 bg-surface dark:border-white/5"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                  linha.posicao === 1
                    ? "bg-gold-400 text-navy-950"
                    : linha.posicao <= 3
                      ? "bg-gold-400/30 text-gold-500"
                      : "bg-surface-muted text-foreground/50"
                }`}
              >
                {linha.posicao}
              </span>
              <span className={`flex-1 text-sm font-medium ${souEu ? "text-brand-500" : "text-foreground"}`}>
                {linha.nome}
                {souEu ? " (você)" : ""}
              </span>
              <span className="text-sm font-semibold text-foreground/70">{linha.pontos} pts</span>
            </div>
          );
        })}
      </main>
    </div>
  );
}
