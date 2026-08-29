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
      <header className="header-gradient-gold px-5 pt-12 pb-7 text-navy-950">
        <h1 className="font-display text-4xl leading-none uppercase">Ranking</h1>
        <p className="mt-1.5 text-sm font-semibold text-navy-950/70">
          {ranking.dia
            ? `Ranking atualizado até ${formatarDia(ranking.dia)}`
            : "Ranking ainda não gerado — o primeiro snapshot sai depois da primeira noite do evento."}
        </p>
      </header>

      <main className="flex flex-col gap-2.5 px-5 py-6">
        {ranking.linhas.length === 0 && (
          <p className="py-15 text-center text-sm text-faint">Nenhum snapshot de ranking disponível ainda.</p>
        )}

        {ranking.linhas.map((linha) => {
          const souEu = session?.id === linha.idParticipante;
          return (
            <div
              key={linha.idParticipante}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                souEu ? "border-brand-500 bg-brand-500/10" : "border-line bg-surface"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ${
                  linha.posicao === 1
                    ? "bg-gold-400 text-navy-950"
                    : linha.posicao <= 3
                      ? "bg-gold-400/30 text-gold-400"
                      : "bg-surface-muted text-faint"
                }`}
              >
                {linha.posicao}
              </span>
              <span className={`flex-1 text-[15px] font-extrabold ${souEu ? "text-brand-500" : "text-foreground"}`}>
                {linha.nome}
                {souEu ? " (você)" : ""}
              </span>
              <span className="font-heading text-lg font-bold text-gold-400">
                {linha.pontos}
                <span className="ml-1 text-[11px] font-normal text-faint">pts</span>
              </span>
            </div>
          );
        })}
      </main>
    </div>
  );
}
