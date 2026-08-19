import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LinhaRanking = {
  id_participante: number;
  pontos_totais: bigint;
  posicao: bigint;
};

/**
 * Job noturno do ranking. Agrega pontos por participante (sempre derivado —
 * nunca lido de um contador), calcula a posição via ROW_NUMBER() e grava um
 * snapshot do dia. Protegido por CRON_SECRET; configurado em vercel.json
 * para rodar às 03:00.
 *
 * O timestamp do cron da Vercel é sempre UTC. Se o evento acontece num fuso
 * diferente de UTC, ajuste o horário em vercel.json para corresponder a
 * ~3h da manhã no fuso do evento (ex: evento em UTC-3 → agendar `0 6 * * *`
 * em UTC), senão o snapshot pode cair no dia de calendário errado.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const hoje = new Date();

    const linhas = await prisma.$queryRaw<LinhaRanking[]>`
      WITH pontos_presenca AS (
        SELECT p.id_participante, COALESCE(SUM(s.pontos_base), 0) AS pontos
        FROM presenca p
        JOIN sessao s ON s.id_sessao = p.id_sessao
        GROUP BY p.id_participante
      ),
      pontos_missao AS (
        SELECT md.id_participante, COALESCE(SUM(m.pontos_bonus), 0) AS pontos
        FROM missao_desbloqueada md
        JOIN missao m ON m.id_missao = md.id_missao
        GROUP BY md.id_participante
      ),
      totais AS (
        SELECT
          part.id_participante AS id_participante,
          COALESCE(pp.pontos, 0) + COALESCE(pm.pontos, 0) AS pontos_totais
        FROM participante part
        LEFT JOIN pontos_presenca pp ON pp.id_participante = part.id_participante
        LEFT JOIN pontos_missao pm ON pm.id_participante = part.id_participante
        WHERE part.role = 'PARTICIPANTE'
      )
      SELECT
        id_participante,
        pontos_totais,
        ROW_NUMBER() OVER (ORDER BY pontos_totais DESC, id_participante ASC) AS posicao
      FROM totais
      ORDER BY posicao;
    `;

    // createMany + skipDuplicates: a constraint única (idParticipante, dia)
    // garante que rodar o cron duas vezes no mesmo dia não duplica
    // registros — idempotente por construção, sem lógica extra aqui.
    const resultado = await prisma.rankingSnapshot.createMany({
      data: linhas.map((linha) => ({
        idParticipante: linha.id_participante,
        pontosCalculados: Number(linha.pontos_totais),
        posicao: Number(linha.posicao),
        dia: hoje,
        geradoEm: hoje,
      })),
      skipDuplicates: true,
    });

    revalidateTag("ranking", "max");

    return NextResponse.json({ ok: true, participantes: linhas.length, gravados: resultado.count });
  } catch (error) {
    console.error("Cron de ranking falhou:", error);
    return NextResponse.json({ ok: false, erro: "Falha ao gerar o snapshot do ranking." }, { status: 500 });
  }
}
