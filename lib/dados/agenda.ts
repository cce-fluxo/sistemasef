import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AgendaItem = {
  id: number;
  titulo: string;
  local: string | null;
  horario: string | null;
  categoria: "ESTANDE" | "PALESTRA";
};

export type AgendaDia = {
  data: string;
  itens: AgendaItem[];
};

async function buscarAgenda(): Promise<AgendaDia[]> {
  const sessoes = await prisma.sessao.findMany({
    where: { dia: { not: null } },
    orderBy: [{ dia: "asc" }, { horario: "asc" }],
  });

  const porDia = new Map<string, AgendaItem[]>();
  for (const sessao of sessoes) {
    const chave = sessao.dia!.toISOString().slice(0, 10);
    const itens = porDia.get(chave) ?? [];
    itens.push({
      id: sessao.id,
      titulo: sessao.nome,
      local: sessao.local,
      horario: sessao.horario,
      categoria: sessao.tipo,
    });
    porDia.set(chave, itens);
  }

  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, itens]) => ({ data, itens }));
}

/**
 * Agenda (sessões com dia/horário/local definidos) — cacheada sob a mesma
 * tag "catalogo" usada por lib/dados/catalogo.ts, invalidada quando um admin
 * cria/edita/exclui uma Sessao.
 */
export const getAgenda = unstable_cache(buscarAgenda, ["agenda"], {
  tags: ["catalogo"],
});
