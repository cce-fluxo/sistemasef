import { unstable_cache, revalidateTag } from "next/cache";
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

/**
 * Uma Missao (título, pontosBonus, exclusão) afeta o resumo de todo
 * participante que já a desbloqueou — não só quem faz check-in agora. Toda
 * action que cria, edita ou deleta uma Missao precisa chamar isto para não
 * deixar `getResumoParticipante` servindo pontuação desatualizada.
 */
export async function invalidarResumoDeParticipantesComMissao(idMissao: number): Promise<void> {
  const desbloqueios = await prisma.missaoDesbloqueada.findMany({
    where: { idMissao },
    select: { idParticipante: true },
  });

  for (const { idParticipante } of desbloqueios) {
    revalidateTag(`participante:${idParticipante}:resumo`, "max");
  }
}
