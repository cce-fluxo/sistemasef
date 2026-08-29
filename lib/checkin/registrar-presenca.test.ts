import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

// Mock do client Prisma: os testes exercitam só o fluxo de controle de
// `registrarPresenca` (pré-checagem → upsert → tratamento do P2002 da
// corrida), não SQL real. A concorrência de verdade é validada pelo k6
// contra staging — ver load-tests/stress-test-qr-scan.js.
const prismaMock = vi.hoisted(() => ({
  sessao: { findUnique: vi.fn() },
  presenca: { findUniqueOrThrow: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const avaliarMissoesMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/missoes/avaliador", () => ({ avaliarMissoes: avaliarMissoesMock }));

import { QrCodeNaoEncontradoError, registrarPresenca } from "./registrar-presenca";

const SESSAO = { id: 10, nome: "Palestra de Abertura", pontosBase: 50 };

function erroP2002() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "7.9.1",
  });
}

// `tx` que representa "a Presença ainda não existe" — deixa o fluxo completo
// rodar (findMany de presenças/missões + createMany).
function txSemPresenca() {
  return {
    presenca: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([
        { idSessao: 10, registradoEm: new Date("2026-08-28T12:00:00Z"), sessao: { tipo: "PALESTRA" } },
      ]),
    },
    missao: { findMany: vi.fn().mockResolvedValue([]) },
    missaoDesbloqueada: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.sessao.findUnique.mockResolvedValue(SESSAO);
  avaliarMissoesMock.mockReturnValue([]);
});

describe("registrarPresenca — primeiro check-in", () => {
  it("registra a presença e credita os pontos base", async () => {
    prismaMock.$transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb(txSemPresenca()));

    const resultado = await registrarPresenca(1, "QR-ABERTURA");

    expect(resultado).toEqual({
      jaRegistrado: false,
      nomeSessao: SESSAO.nome,
      pontosGanhos: SESSAO.pontosBase,
      missoesDesbloqueadas: [],
    });
    expect(avaliarMissoesMock).toHaveBeenCalledTimes(1);
    expect(prismaMock.presenca.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});

describe("registrarPresenca — corrida concorrente (P2002)", () => {
  it("a requisição perdedora retorna sucesso idempotente sem reavaliar missões", async () => {
    prismaMock.$transaction.mockRejectedValue(erroP2002());
    prismaMock.presenca.findUniqueOrThrow.mockResolvedValue({ id: 999 });

    const resultado = await registrarPresenca(1, "QR-ABERTURA");

    expect(resultado).toEqual({
      jaRegistrado: true,
      nomeSessao: SESSAO.nome,
      pontosGanhos: 0,
      missoesDesbloqueadas: [],
    });
    // Confirma a Presença criada pela requisição vencedora...
    expect(prismaMock.presenca.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { idParticipante_idSessao: { idParticipante: 1, idSessao: SESSAO.id } },
      select: { id: true },
    });
    // ...e NÃO roda avaliação de missões (isso duplicaria pontos).
    expect(avaliarMissoesMock).not.toHaveBeenCalled();
  });

  it("duas chamadas concorrentes para o mesmo par: ambas sucesso, missões avaliadas uma única vez", async () => {
    prismaMock.presenca.findUniqueOrThrow.mockResolvedValue({ id: 999 });
    // 1ª chamada vence (transação roda de verdade); 2ª perde com P2002.
    prismaMock.$transaction
      .mockImplementationOnce((cb: (tx: unknown) => unknown) => cb(txSemPresenca()))
      .mockRejectedValueOnce(erroP2002());

    const [a, b] = await Promise.all([
      registrarPresenca(7, "QR-ABERTURA"),
      registrarPresenca(7, "QR-ABERTURA"),
    ]);

    expect(a.jaRegistrado).toBe(false);
    expect(b.jaRegistrado).toBe(true);
    expect(a.pontosGanhos).toBe(SESSAO.pontosBase);
    expect(b.pontosGanhos).toBe(0);
    // Pontos creditados uma vez só, missões avaliadas uma vez só.
    expect(avaliarMissoesMock).toHaveBeenCalledTimes(1);
  });

  it("não engole outros erros conhecidos do Prisma (ex.: P2028)", async () => {
    prismaMock.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unable to start a transaction", {
        code: "P2028",
        clientVersion: "7.9.1",
      }),
    );

    await expect(registrarPresenca(1, "QR-ABERTURA")).rejects.toMatchObject({ code: "P2028" });
    expect(prismaMock.presenca.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});

describe("registrarPresenca — erros de QR preservados", () => {
  it("lança QrCodeNaoEncontradoError quando o QR não bate com nenhuma sessão", async () => {
    prismaMock.sessao.findUnique.mockResolvedValue(null);

    await expect(registrarPresenca(1, "QR-INEXISTENTE")).rejects.toBeInstanceOf(
      QrCodeNaoEncontradoError,
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
