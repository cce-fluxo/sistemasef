import { describe, expect, it } from "vitest";
import { avaliarMissoes, type MissaoParaAvaliar, type PresencaParaAvaliacao } from "./avaliador";

function presenca(
  idSessao: number,
  tipoSessao: "ESTANDE" | "PALESTRA",
  dia: string,
): PresencaParaAvaliacao {
  return { idSessao, tipoSessao, registradoEm: new Date(dia) };
}

function missao(overrides: Partial<MissaoParaAvaliar> & { id: number }): MissaoParaAvaliar {
  return { idSessao: null, tipoCriterio: "SESSAO_DIRETA", parametro: 1, ...overrides };
}

describe("avaliarMissoes — SESSAO_DIRETA", () => {
  const alvo = missao({ id: 1, tipoCriterio: "SESSAO_DIRETA", idSessao: 42, parametro: 1 });

  it("desbloqueia ao encontrar presença na sessão indicada", () => {
    const presencas = [presenca(42, "PALESTRA", "2026-09-14")];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([alvo]);
  });

  it("não desbloqueia sem presença na sessão indicada", () => {
    const presencas = [presenca(7, "PALESTRA", "2026-09-14")];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([]);
  });
});

describe("avaliarMissoes — STANDS_POR_DIA", () => {
  const alvo = missao({ id: 2, tipoCriterio: "STANDS_POR_DIA", parametro: 3 });

  it("desbloqueia quando o parâmetro de estandes é atingido no mesmo dia", () => {
    const presencas = [
      presenca(1, "ESTANDE", "2026-09-14"),
      presenca(2, "ESTANDE", "2026-09-14"),
      presenca(3, "ESTANDE", "2026-09-14"),
    ];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([alvo]);
  });

  it("não desbloqueia se os estandes estão espalhados em dias diferentes", () => {
    const presencas = [
      presenca(1, "ESTANDE", "2026-09-14"),
      presenca(2, "ESTANDE", "2026-09-15"),
      presenca(3, "ESTANDE", "2026-09-16"),
    ];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([]);
  });

  it("ignora presenças em palestras na contagem", () => {
    const presencas = [
      presenca(1, "ESTANDE", "2026-09-14"),
      presenca(2, "ESTANDE", "2026-09-14"),
      presenca(3, "PALESTRA", "2026-09-14"),
    ];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([]);
  });
});

describe("avaliarMissoes — PRESENCA_DIARIA_STREAK", () => {
  const alvo = missao({ id: 3, tipoCriterio: "PRESENCA_DIARIA_STREAK", parametro: 3 });

  it("desbloqueia com presença em dias distintos suficientes", () => {
    const presencas = [
      presenca(1, "ESTANDE", "2026-09-14"),
      presenca(2, "PALESTRA", "2026-09-15"),
      presenca(3, "ESTANDE", "2026-09-16"),
    ];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([alvo]);
  });

  it("múltiplas presenças no mesmo dia contam como um dia só", () => {
    const presencas = [
      presenca(1, "ESTANDE", "2026-09-14"),
      presenca(2, "PALESTRA", "2026-09-14"),
      presenca(3, "ESTANDE", "2026-09-15"),
    ];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([]);
  });
});

describe("avaliarMissoes — PALESTRAS_TOTAL", () => {
  const alvo = missao({ id: 4, tipoCriterio: "PALESTRAS_TOTAL", parametro: 2 });

  it("desbloqueia ao atingir o total de palestras", () => {
    const presencas = [presenca(1, "PALESTRA", "2026-09-14"), presenca(2, "PALESTRA", "2026-09-15")];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([alvo]);
  });

  it("não conta presenças em estandes", () => {
    const presencas = [presenca(1, "PALESTRA", "2026-09-14"), presenca(2, "ESTANDE", "2026-09-15")];
    expect(avaliarMissoes(presencas, [alvo])).toEqual([]);
  });
});

describe("avaliarMissoes — comportamento geral", () => {
  it("retorna só as missões satisfeitas dentre várias pendentes", () => {
    const sessaoDireta = missao({ id: 1, tipoCriterio: "SESSAO_DIRETA", idSessao: 10 });
    const palestrasTotal = missao({ id: 4, tipoCriterio: "PALESTRAS_TOTAL", parametro: 5 });
    const presencas = [presenca(10, "ESTANDE", "2026-09-14")];

    expect(avaliarMissoes(presencas, [sessaoDireta, palestrasTotal])).toEqual([sessaoDireta]);
  });

  it("lança erro para tipo_criterio desconhecido", () => {
    const invalida = missao({ id: 99, tipoCriterio: "CRITERIO_INEXISTENTE" });
    expect(() => avaliarMissoes([], [invalida])).toThrow(/tipo_criterio desconhecido/);
  });

  it("não desbloqueia nada quando não há presenças", () => {
    const alvo = missao({ id: 3, tipoCriterio: "PRESENCA_DIARIA_STREAK", parametro: 1 });
    expect(avaliarMissoes([], [alvo])).toEqual([]);
  });
});
