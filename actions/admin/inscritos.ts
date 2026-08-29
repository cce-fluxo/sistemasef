"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { refreshInscritosCache } from "@/lib/redis-inscritos";

export type RefreshInscritosState =
  | { ok: true; total: number }
  | { ok: false; erro: string };

/**
 * Gatilho manual do refresh do cache de inscritos (mesmo trabalho que
 * app/api/cron/refresh-inscritos fazia pelo cron). Exposto na home só para
 * ADMIN, via components/admin/RefreshInscritosButton.
 */
export async function refreshInscritosAction(
  _prevState: RefreshInscritosState | null,
  _formData: FormData,
): Promise<RefreshInscritosState> {
  await requireAdmin();

  try {
    const total = await refreshInscritosCache();
    return { ok: true, total };
  } catch (error) {
    console.error("Refresh manual de inscritos falhou:", error);
    return { ok: false, erro: "Falha ao recarregar a lista de inscritos." };
  }
}
