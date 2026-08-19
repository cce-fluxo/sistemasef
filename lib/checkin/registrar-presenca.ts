import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { avaliarMissoes } from "@/lib/missoes/avaliador";

export type CheckinResultado = {
  jaRegistrado: boolean;
  nomeSessao: string;
  pontosGanhos: number;
  missoesDesbloqueadas: { titulo: string; pontosBonus: number }[];
};

const qrCodeSchema = z.string().trim().min(1);

export class QrCodeInvalidoError extends Error {}
export class QrCodeNaoEncontradoError extends Error {}

/**
 * O scanner pode decodificar tanto o código puro quanto uma URL que o
 * contenha (ex: QR impresso por um sistema externo). Tenta extrair de um
 * query param `code` ou do último segmento do path; se não for uma URL
 * válida, assume que o valor inteiro já é o código.
 */
export function extrairQrCode(valorEscaneado: string): string {
  try {
    const url = new URL(valorEscaneado);
    const codigoQuery = url.searchParams.get("code");
    if (codigoQuery) return codigoQuery;
    const segmentos = url.pathname.split("/").filter(Boolean);
    return segmentos[segmentos.length - 1] ?? valorEscaneado;
  } catch {
    return valorEscaneado;
  }
}

/**
 * Lógica de negócio pura do check-in (sem auth, sem rate limit, sem
 * invalidação de cache) -- compartilhada entre a Server Action de scan
 * (`actions/checkin.ts`) e o Route Handler de load testing
 * (`app/api/_loadtest/scan/route.ts`). Ambos os chamadores continuam
 * responsáveis por autenticar o participante e aplicar rate limiting antes
 * de chegar aqui.
 */
export async function registrarPresenca(
  participanteId: number,
  qrCodeEscaneado: string,
): Promise<CheckinResultado> {
  const parsed = qrCodeSchema.safeParse(qrCodeEscaneado);
  if (!parsed.success) {
    throw new QrCodeInvalidoError("QR Code inválido.");
  }

  const qrCode = extrairQrCode(parsed.data);
  const sessao = await prisma.sessao.findUnique({
    where: { qrCode },
    select: { id: true, nome: true, pontosBase: true },
  });
  if (!sessao) {
    throw new QrCodeNaoEncontradoError("QR Code não corresponde a nenhuma sessão do evento.");
  }

  return prisma.$transaction(async (tx) => {
    // Pré-checagem "melhor esforço" só para a UX de "presença já
    // registrada" — a garantia real de não duplicar é o upsert abaixo,
    // que se apoia na constraint única (idParticipante, idSessao) e é
    // atômico mesmo sob concorrência.
    const jaExistia = await tx.presenca.findUnique({
      where: { idParticipante_idSessao: { idParticipante: participanteId, idSessao: sessao.id } },
      select: { id: true },
    });

    await tx.presenca.upsert({
      where: { idParticipante_idSessao: { idParticipante: participanteId, idSessao: sessao.id } },
      create: { idParticipante: participanteId, idSessao: sessao.id, registradoEm: new Date() },
      update: {},
    });

    if (jaExistia) {
      return {
        jaRegistrado: true,
        nomeSessao: sessao.nome,
        pontosGanhos: 0,
        missoesDesbloqueadas: [],
      } satisfies CheckinResultado;
    }

    const [presencas, missoesPendentes] = await Promise.all([
      tx.presenca.findMany({
        where: { idParticipante: participanteId },
        select: { idSessao: true, registradoEm: true, sessao: { select: { tipo: true } } },
      }),
      tx.missao.findMany({
        where: { missoesDesbloqueadas: { none: { idParticipante: participanteId } } },
      }),
    ]);

    const missoesSatisfeitas = avaliarMissoes(
      presencas.map((p) => ({
        idSessao: p.idSessao,
        tipoSessao: p.sessao.tipo,
        registradoEm: p.registradoEm,
      })),
      missoesPendentes,
    );

    if (missoesSatisfeitas.length > 0) {
      await tx.missaoDesbloqueada.createMany({
        data: missoesSatisfeitas.map((m) => ({
          idParticipante: participanteId,
          idMissao: m.id,
          desbloqueadaEm: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    const pontosBonus = missoesSatisfeitas.reduce((soma, m) => soma + m.pontosBonus, 0);

    return {
      jaRegistrado: false,
      nomeSessao: sessao.nome,
      pontosGanhos: sessao.pontosBase + pontosBonus,
      missoesDesbloqueadas: missoesSatisfeitas.map((m) => ({ titulo: m.titulo, pontosBonus: m.pontosBonus })),
    } satisfies CheckinResultado;
  });
}
