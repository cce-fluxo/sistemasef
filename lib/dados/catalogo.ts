import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CatalogoPontuacao = {
  pontosMaximos: number;
  totalMissoes: number;
};

async function buscarCatalogoPontuacao(): Promise<CatalogoPontuacao> {
  const [sessoes, missoes] = await Promise.all([
    prisma.sessao.aggregate({ _sum: { pontosBase: true } }),
    prisma.missao.aggregate({ _sum: { pontosBonus: true }, _count: true }),
  ]);

  return {
    pontosMaximos: (sessoes._sum.pontosBase ?? 0) + (missoes._sum.pontosBonus ?? 0),
    totalMissoes: missoes._count,
  };
}

/**
 * Catálogo (sessões + missões) muda principalmente pela área admin — cacheado
 * sob a tag "catalogo", invalidada quando um admin cria/edita Sessao ou
 * Missao. `revalidate` funciona como rede de segurança para mudanças feitas
 * fora do app (seed, Prisma Studio, SQL direto), que não passam por
 * revalidateTag.
 */
export const getCatalogoPontuacao = unstable_cache(buscarCatalogoPontuacao, ["catalogo-pontuacao"], {
  tags: ["catalogo"],
  revalidate: 30,
});
