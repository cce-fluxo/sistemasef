import { NextResponse } from "next/server";
import { refreshInscritosCache } from "@/lib/redis-inscritos";

export const dynamic = "force-dynamic";

/**
 * Recarrega no Redis o Set de e-mails inscritos na Semana Fluxo, lendo a
 * planilha oficial via Google Sheets API. A Server Action de cadastro só faz
 * SISMEMBER nesse cache — a leitura pesada da planilha (~6.000 linhas) fica
 * isolada aqui.
 *
 * Protegido por CRON_SECRET (mesmo padrão de app/api/cron/ranking);
 * configurado em vercel.json para rodar a cada 5 minutos.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const emails = await refreshInscritosCache();
    return NextResponse.json({ ok: true, emails });
  } catch (error) {
    console.error("Cron de inscritos falhou:", error);
    return NextResponse.json(
      { ok: false, erro: "Falha ao recarregar a lista de inscritos." },
      { status: 500 },
    );
  }
}
