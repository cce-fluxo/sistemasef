import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Gatilho manual para invalidar o cache do ranking em produção sem esperar o
 * cron noturno (app/api/cron/ranking). Útil quando o snapshot já está correto
 * no banco mas a tela ainda serve a versão cacheada do `unstable_cache`
 * (lib/dados/ranking.ts, tag "ranking").
 *
 * Protegido pelo mesmo CRON_SECRET do cron. Aceita o segredo via header
 * `Authorization: Bearer <secret>` ou querystring `?secret=<secret>`:
 *
 *   curl -X POST "https://SEU-DOMINIO/api/admin/revalidate-ranking?secret=$CRON_SECRET"
 *
 * `{ expire: 0 }` expira a entrada imediatamente (cache miss bloqueante na
 * próxima visita), ao contrário de `"max"`, que só marca como stale.
 */
async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ erro: "CRON_SECRET não configurado." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  const autorizado = authHeader === `Bearer ${secret}` || querySecret === secret;
  if (!autorizado) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  revalidateTag("ranking", { expire: 0 });
  return NextResponse.json({ ok: true, tag: "ranking", em: new Date().toISOString() });
}

export const GET = handle;
export const POST = handle;
