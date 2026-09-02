import type { TipoSessao } from "@prisma/client";

// `tipo_criterio` é varchar livre no banco (Missao.tipoCriterio) — nenhuma
// migration é necessária para adicionar um novo critério. Em compensação,
// tratamos como union type aqui e validamos em runtime: um valor fora desta
// lista lança erro em vez de silenciosamente não desbloquear nada.
export type TipoCriterio =
  | "SESSAO_DIRETA"
  | "STANDS_POR_DIA"
  | "PALESTRAS_POR_DIA"
  | "PRESENCA_DIARIA_STREAK"
  | "PALESTRAS_TOTAL";

export type PresencaParaAvaliacao = {
  idSessao: number;
  tipoSessao: TipoSessao;
  registradoEm: Date;
};

export type MissaoParaAvaliar = {
  id: number;
  idSessao: number | null;
  tipoCriterio: string;
  parametro: number;
  // Trava de data: presenças anteriores ao dia em que a missão foi criada
  // não contam para nenhum critério — sem isso, criar uma missão hoje
  // creditaria pontos retroativos a quem já bateu o critério ontem.
  criadoEm: Date;
};

function chaveDia(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function satisfazCriterio(missao: MissaoParaAvaliar, presencas: PresencaParaAvaliacao[]): boolean {
  const criterio = missao.tipoCriterio as TipoCriterio;

  // Comparação lexicográfica de `YYYY-MM-DD` == comparação cronológica.
  const desde = chaveDia(missao.criadoEm);
  const presencasValidas = presencas.filter((p) => chaveDia(p.registradoEm) >= desde);

  switch (criterio) {
    case "SESSAO_DIRETA":
      return presencasValidas.some((p) => p.idSessao === missao.idSessao);

    case "STANDS_POR_DIA": {
      const estandesPorDia = new Map<string, number>();
      for (const p of presencasValidas) {
        if (p.tipoSessao !== "ESTANDE") continue;
        const chave = chaveDia(p.registradoEm);
        estandesPorDia.set(chave, (estandesPorDia.get(chave) ?? 0) + 1);
      }
      return [...estandesPorDia.values()].some((quantidade) => quantidade >= missao.parametro);
    }

    case "PALESTRAS_POR_DIA": {
      const palestrasPorDia = new Map<string, number>();
      for (const p of presencasValidas) {
        if (p.tipoSessao !== "PALESTRA") continue;
        const chave = chaveDia(p.registradoEm);
        palestrasPorDia.set(chave, (palestrasPorDia.get(chave) ?? 0) + 1);
      }
      return [...palestrasPorDia.values()].some((quantidade) => quantidade >= missao.parametro);
    }

    case "PRESENCA_DIARIA_STREAK": {
      const diasComPresenca = new Set(presencasValidas.map((p) => chaveDia(p.registradoEm)));
      return diasComPresenca.size >= missao.parametro;
    }

    case "PALESTRAS_TOTAL":
      return presencasValidas.filter((p) => p.tipoSessao === "PALESTRA").length >= missao.parametro;

    default: {
      const criterioDesconhecido: never = criterio;
      throw new Error(`tipo_criterio desconhecido: ${String(criterioDesconhecido)}`);
    }
  }
}

/**
 * Recebe o histórico completo de presenças de um participante e a lista de
 * missões ainda não desbloqueadas por ele, devolve as que passaram a ser
 * satisfeitas. Função pura — sem I/O — para ser chamada tanto dentro da
 * transação da Server Action de check-in quanto em testes.
 *
 * Genérica sobre `T extends MissaoParaAvaliar` para que chamadores possam
 * passar o registro `Missao` completo do Prisma (com `titulo`,
 * `pontosBonus` etc.) e receber de volta esses mesmos campos, sem precisar
 * re-buscar as missões satisfeitas depois.
 */
export function avaliarMissoes<T extends MissaoParaAvaliar>(
  presencas: PresencaParaAvaliacao[],
  missoesPendentes: T[],
): T[] {
  return missoesPendentes.filter((missao) => satisfazCriterio(missao, presencas));
}
