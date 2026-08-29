import { NextResponse } from "next/server";
import { z } from "zod";
import { getRatelimiter } from "@/lib/ratelimit";
import { registrarPresenca, QrCodeInvalidoError, QrCodeNaoEncontradoError } from "@/lib/checkin/registrar-presenca";

/**
 * Endpoint TEMPORÁRIO só para load testing (k6) do fluxo de check-in via QR
 * code -- não faz parte da API pública do produto. Reutiliza a mesma lógica
 * de negócio da Server Action `checkInAction` (`actions/checkin.ts`), mas
 * troca a autenticação por sessão JWT por um `participanteId` explícito no
 * body, já que k6 não navega o app real e recapturar/renovar um cookie de
 * sessão a cada corrida de teste é inviável.
 *
 * Só responde quando `ENABLE_LOADTEST_ENDPOINT=true` -- em qualquer outro
 * caso devolve 404 (não 403) para não sinalizar nem a existência da rota.
 * Nunca deve ser habilitado em produção; ver load-tests/README.md.
 *
 * O caminho `/api/loadtest-scan` também precisa estar isento do gate de
 * sessão no middleware (ver matcher em `proxy.ts`), senão o k6 (sem cookie)
 * é redirecionado para /login antes de chegar aqui.
 */

const bodySchema = z.object({
  qrCode: z.string().trim().min(1),
  participanteId: z.number().int().positive(),
});

export async function POST(request: Request) {
  if (process.env.ENABLE_LOADTEST_ENDPOINT !== "true") {
    return new NextResponse(null, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erro: "Body inválido. Esperado { qrCode, participanteId }." }, { status: 400 });
  }
  const { qrCode, participanteId } = parsed.data;

  try {
    // Mesmo rate limiter (mesmo prefixo/janela) que a Server Action de
    // check-in aplica, para o load test continuar validando esse
    // comportamento sob carga real.
    const { success: allowed } = await getRatelimiter("checkin", 10, 60).limit(String(participanteId));
    if (!allowed) {
      return NextResponse.json({ erro: "Muitos check-ins em pouco tempo." }, { status: 429 });
    }

    const resultado = await registrarPresenca(participanteId, qrCode);
    return NextResponse.json({ ok: true, data: resultado });
  } catch (error) {
    if (error instanceof QrCodeInvalidoError) {
      return NextResponse.json({ erro: "QR Code inválido." }, { status: 400 });
    }
    if (error instanceof QrCodeNaoEncontradoError) {
      return NextResponse.json({ erro: "QR Code não corresponde a nenhuma sessão do evento." }, { status: 404 });
    }
    console.error("Endpoint de load test (/api/loadtest-scan/scan) falhou:", error);
    return NextResponse.json({ erro: "Não foi possível registrar o check-in." }, { status: 500 });
  }
}
