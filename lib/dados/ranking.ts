import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RankingLinha = {
  posicao: number;
  idParticipante: number;
  nome: string;
  pontos: number;
};

export type RankingAtual = {
  dia: Date | null;
  linhas: RankingLinha[];
};

async function buscarRankingAtual(): Promise<RankingAtual> {
  // A tela de ranking só lê Ranking_Snapshot — nunca agrega ao vivo. O
  // snapshot é gerado 1x por noite pelo cron (etapa 6).
  const ultimo = await prisma.rankingSnapshot.findFirst({
    orderBy: { dia: "desc" },
    select: { dia: true },
  });
  if (!ultimo) return { dia: null, linhas: [] };

  const linhas = await prisma.rankingSnapshot.findMany({
    where: { dia: ultimo.dia },
    orderBy: { posicao: "asc" },
    select: {
      posicao: true,
      pontosCalculados: true,
      participante: { select: { id: true, nome: true } },
    },
  });

  return {
    dia: ultimo.dia,
    linhas: linhas.map((linha) => ({
      posicao: linha.posicao,
      idParticipante: linha.participante.id,
      nome: linha.participante.nome,
      pontos: linha.pontosCalculados,
    })),
  };
}

/**
 * Cacheada sob a tag "ranking", invalidada pelo cron (etapa 6) depois de
 * gravar o snapshot da noite.
 */
const buscarRankingAtualCacheado = unstable_cache(buscarRankingAtual, ["ranking-atual"], {
  tags: ["ranking"],
});

export async function getRankingAtual(): Promise<RankingAtual> {
  const ranking = await buscarRankingAtualCacheado();
  // unstable_cache serializa via JSON, então `dia` volta como string em cache hits.
  return { ...ranking, dia: ranking.dia ? new Date(ranking.dia) : null };
}
