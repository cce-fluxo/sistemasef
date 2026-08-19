import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ResumoParticipante = {
  pontosTotais: number;
  totalMissoesDesbloqueadas: number;
  ultimasMissoes: { titulo: string; pontosBonus: number }[];
};

async function buscarResumoParticipante(idParticipante: number): Promise<ResumoParticipante> {
  const [presencas, missoesDesbloqueadas] = await Promise.all([
    prisma.presenca.findMany({
      where: { idParticipante },
      select: { sessao: { select: { pontosBase: true } } },
    }),
    prisma.missaoDesbloqueada.findMany({
      where: { idParticipante },
      orderBy: { desbloqueadaEm: "desc" },
      select: { missao: { select: { titulo: true, pontosBonus: true } } },
    }),
  ]);

  // Pontuação sempre derivada — nunca lida de um contador em Participante.
  const pontosPresencas = presencas.reduce((soma, p) => soma + p.sessao.pontosBase, 0);
  const pontosMissoes = missoesDesbloqueadas.reduce((soma, m) => soma + m.missao.pontosBonus, 0);

  return {
    pontosTotais: pontosPresencas + pontosMissoes,
    totalMissoesDesbloqueadas: missoesDesbloqueadas.length,
    ultimasMissoes: missoesDesbloqueadas.slice(0, 3).map((m) => m.missao),
  };
}

/**
 * Cacheada por participante com a tag `participante:{id}:resumo` — a mesma
 * que `checkInAction` invalida via `updateTag` logo após gravar uma nova
 * Presenca/MissaoDesbloqueada.
 */
export function getResumoParticipante(idParticipante: number): Promise<ResumoParticipante> {
  return unstable_cache(() => buscarResumoParticipante(idParticipante), [`participante-resumo-${idParticipante}`], {
    tags: [`participante:${idParticipante}:resumo`],
  })();
}
