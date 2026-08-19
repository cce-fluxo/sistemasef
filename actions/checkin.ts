"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { getRatelimiter } from "@/lib/ratelimit";
import {
  registrarPresenca,
  QrCodeInvalidoError,
  QrCodeNaoEncontradoError,
  type CheckinResultado,
} from "@/lib/checkin/registrar-presenca";

export type { CheckinResultado };

export type CheckinActionState = { ok: true; data: CheckinResultado } | { ok: false; erro: string };

export async function checkInAction(qrCodeEscaneado: string): Promise<CheckinActionState> {
  const session = await getSession();
  if (!session) {
    return { ok: false, erro: "Sessão inválida. Faça login novamente." };
  }

  try {
    const { success: allowed } = await getRatelimiter("checkin", 10, 60).limit(String(session.id));
    if (!allowed) {
      return { ok: false, erro: "Muitos check-ins em pouco tempo. Aguarde um instante e tente de novo." };
    }

    const resultado = await registrarPresenca(session.id, qrCodeEscaneado);

    if (!resultado.jaRegistrado) {
      // Tag seletiva por participante — nunca revalidatePath('/'). Usa
      // `updateTag` (não `revalidateTag`) porque estamos dentro de uma
      // Server Action: é a API do Next 16 para semântica "read-your-own-
      // writes" imediata. Home, missões e ranking (etapa 5) devem ler
      // dados cacheados com essa mesma tag via `unstable_cache` para se
      // beneficiarem disto.
      updateTag(`participante:${session.id}:resumo`);
    }

    return { ok: true, data: resultado };
  } catch (error) {
    if (error instanceof QrCodeInvalidoError) {
      return { ok: false, erro: "QR Code inválido." };
    }
    if (error instanceof QrCodeNaoEncontradoError) {
      return { ok: false, erro: "QR Code não corresponde a nenhuma sessão do evento." };
    }
    // Nenhuma Server Action pode deixar uma exception crua chegar ao
    // cliente — sempre um retorno discriminado, mesmo para erros
    // inesperados (a mensagem real vai só pro log do servidor).
    console.error("checkInAction falhou:", error);
    return { ok: false, erro: "Não foi possível registrar o check-in. Tente novamente." };
  }
}
