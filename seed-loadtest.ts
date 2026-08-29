/**
 * Seed de dados fictícios para o banco de TESTE (stress test do k6).
 *
 * NUNCA rode isso apontando pro DATABASE_URL de produção -- ele cria
 * centenas de Participantes e Sessoes fictícios.
 *
 * COMO RODAR (a partir da raiz do projeto, com .env.loadtest.local
 * configurado com o DATABASE_URL do banco de teste):
 *
 *   npm install -D tsx   // se ainda não tiver
 *   npx dotenv -e .env.loadtest.local -- npx tsx seed-loadtest.ts
 *
 * Ajuste as quantidades abaixo (ou via env vars SEED_PARTICIPANTES /
 * SEED_SESSOES) conforme o volume que você quer simular no teste. É
 * idempotente: rodar de novo com um SEED_PARTICIPANTES maior só cria os que
 * faltam. Para só adicionar participantes (subir VUs) sem mexer nas sessões:
 *
 *   SEED_PARTICIPANTES=1000 SEED_SESSOES=0 SKIP_SAFETY_CHECK=true \
 *     npx dotenv -e .env.loadtest.local -- npx tsx seed-loadtest.ts
 *
 * No final, o script imprime duas linhas prontas pra colar no k6:
 *   PARTICIPANTE_IDS=1,2,3,...
 *   QR_CODES=abc123...,def456...
 */

import { PrismaClient, TipoSessao } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL não definido. Rode via dotenv-cli apontando pro .env.loadtest.local.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NUM_PARTICIPANTES = Number(process.env.SEED_PARTICIPANTES ?? 300);
const NUM_SESSOES = Number(process.env.SEED_SESSOES ?? 20);

function gerarTokenQrCode(): string {
  // Mesmo estilo dos tokens reais gerados pelo gerar-qrcodes.js
  // (string alfanumérica, sem caracteres ambíguos pro QR ficar limpo).
  return randomBytes(15).toString("base64url").toLowerCase().replace(/[-_]/g, "").slice(0, 24);
}

async function main() {
  // Guarda-corrim simples: mostra em qual banco vai gravar e dá uma janela
  // pra cancelar (Ctrl+C) antes de criar qualquer dado. Não é infalível,
  // mas evita o erro mais comum (esquecer de trocar o .env).
  if (process.env.SKIP_SAFETY_CHECK !== "true") {
    console.log(`Conectando em: ${DATABASE_URL!.replace(/:[^:@]+@/, ":***@")}`);
    console.log("Se esse NÃO for o banco de teste, cancele agora (Ctrl+C). Continuando em 5s...");
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Idempotente: `skipDuplicates` casa pelo email único, então rodar de novo
  // com um NUM_PARTICIPANTES maior só cria os que faltam (ex: 300 -> 1000
  // adiciona 700). NUM_SESSOES=0 pula a criação de sessões e reaproveita as
  // que já existem (útil quando você só quer mais participantes p/ subir VUs).
  console.log(`Garantindo ${NUM_PARTICIPANTES} participantes de teste (cria os que faltarem)...`);

  const participantesData = Array.from({ length: NUM_PARTICIPANTES }, (_, i) => ({
    nome: `Participante Teste ${i + 1}`,
    email: `loadtest.participante${i + 1}@teste.semanafluxo.invalid`,
    hashSenha: "loadtest-nao-e-hash-real", // login não é exercitado pelo stress test
  }));

  const { count: participantesNovos } = await prisma.participante.createMany({
    data: participantesData,
    skipDuplicates: true,
  });
  console.log(`  ${participantesNovos} novo(s) participante(s) criado(s).`);

  if (NUM_SESSOES > 0) {
    console.log(`Criando ${NUM_SESSOES} sessões/QR codes de teste...`);
    const sessoesData = Array.from({ length: NUM_SESSOES }, (_, i) => ({
      nome: `Estande/Palestra Teste ${i + 1}`,
      tipo: i % 2 === 0 ? TipoSessao.ESTANDE : TipoSessao.PALESTRA,
      qrCode: gerarTokenQrCode(),
      pontosBase: 10,
    }));
    const { count: sessoesNovas } = await prisma.sessao.createMany({
      data: sessoesData,
      skipDuplicates: true,
    });
    console.log(`  ${sessoesNovas} nova(s) sessão(ões) criada(s).`);
  } else {
    console.log("NUM_SESSOES=0 -- reaproveitando as sessões/QR codes existentes.");
  }

  // Imprime a lista COMPLETA que está no banco (não só o que foi criado agora),
  // pra colar direto no k6 ou no default de stress-test-qr-scan.js.
  const [participantes, sessoes] = await Promise.all([
    prisma.participante.findMany({
      where: { email: { endsWith: "@teste.semanafluxo.invalid" } },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.sessao.findMany({
      where: { nome: { startsWith: "Estande/Palestra Teste " } },
      select: { qrCode: true },
      orderBy: { id: "asc" },
    }),
  ]);

  console.log(
    `\n✅ Seed concluído: ${participantes.length} participantes, ${sessoes.length} sessões no banco de teste.`,
  );
  console.log("Cole essas linhas no comando do k6 (ou no default do script):\n");
  console.log(`PARTICIPANTE_IDS=${participantes.map((p) => p.id).join(",")}`);
  console.log(`\nQR_CODES=${sessoes.map((s) => s.qrCode).join(",")}`);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
