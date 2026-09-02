import type { Missao, Sessao } from "@prisma/client";

type MissaoComSessao = Pick<Missao, "tipoCriterio" | "parametro"> & {
  sessao?: Pick<Sessao, "nome"> | null;
};

/**
 * Descrição amigável derivada de tipo_criterio + parametro, só para
 * exibição — o motor de avaliação (lib/missoes/avaliador.ts) é quem de fato
 * decide o desbloqueio. Não precisa ser exaustiva como o avaliador: um
 * critério desconhecido aqui vira um texto genérico, não um erro.
 */
export function descreverCriterio(missao: MissaoComSessao): string {
  switch (missao.tipoCriterio) {
    case "SESSAO_DIRETA":
      return missao.sessao
        ? `Registre presença em "${missao.sessao.nome}".`
        : "Registre presença na sessão indicada.";
    case "STANDS_POR_DIA":
      return `Registre presença em ${missao.parametro} estandes diferentes no mesmo dia.`;
    case "PALESTRAS_POR_DIA":
      return `Participe de ${missao.parametro} palestras no mesmo dia.`;
    case "PRESENCA_DIARIA_STREAK":
      return `Registre presença em pelo menos ${missao.parametro} dias distintos do evento.`;
    case "PALESTRAS_TOTAL":
      return `Participe de ${missao.parametro} palestras ao longo do evento.`;
    default:
      return "Complete o critério desta missão.";
  }
}
