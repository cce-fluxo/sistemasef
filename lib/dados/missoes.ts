import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { descreverCriterio } from "@/lib/missoes/descricao";

export type MissaoComStatus = {
  id: number;
  titulo: string;
  descricao: string;
  pontosBonus: number;
  completa: boolean;
};

async function buscarMissoesComStatus(idParticipante: number): Promise<MissaoComStatus[]> {
  const [missoes, desbloqueadas] = await Promise.all([
    prisma.missao.findMany({
      orderBy: { id: "asc" },
      include: { sessao: { select: { nome: true } } },
    }),
    prisma.missaoDesbloqueada.findMany({
      where: { idParticipante },
      select: { idMissao: true },
    }),
  ]);

  const idsDesbloqueados = new Set(desbloqueadas.map((d) => d.idMissao));

  return missoes.map((missao) => ({
    id: missao.id,
    titulo: missao.titulo,
    descricao: descreverCriterio(missao),
    pontosBonus: missao.pontosBonus,
    completa: idsDesbloqueados.has(missao.id),
  }));
}

/**
 * Cacheada tanto pela tag do participante (desbloqueios mudam por
 * check-in) quanto pela tag "catalogo" (o texto/pontuação das missões
 * mudam pela área admin). `revalidate` funciona como rede de segurança
 * para mudanças feitas fora do app (seed, Prisma Studio, SQL direto),
 * que não passam por revalidateTag.
 */
export function getMissoesComStatus(idParticipante: number): Promise<MissaoComStatus[]> {
  return unstable_cache(() => buscarMissoesComStatus(idParticipante), [`missoes-status-${idParticipante}`], {
    tags: [`participante:${idParticipante}:resumo`, "catalogo"],
    revalidate: 30,
  })();
}
