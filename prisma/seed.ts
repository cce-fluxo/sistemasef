// `tsx` não carrega .env sozinho — precisa deste import explícito, tanto
// quando rodado direto via `npm run db:seed` quanto quando `prisma migrate
// dev` dispara este script (que aí depende do processo pai já ter herdado
// as env vars, o que nem sempre é garantido).
import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import { TipoSessao } from "@prisma/client";
// Import relativo (não `@/...`) porque este arquivo roda via `tsx`
// (chamado por `prisma migrate dev`/`db:seed`), que não resolve os path
// aliases do tsconfig usados pelo compilador do Next.
import { prisma } from "../lib/prisma";
import { avaliarMissoes } from "../lib/missoes/avaliador";

// Dia 0 do evento. Os outros 4 dias são consecutivos a partir daqui.
const EVENT_START = new Date("2026-09-14T00:00:00.000Z");
const DIAS = Array.from({ length: 5 }, (_, i) => {
  const d = new Date(EVENT_START);
  d.setUTCDate(d.getUTCDate() + i);
  return d;
});

const ESTANDE_NOMES = [
  "TechCorp",
  "InovaLabs",
  "CloudNine",
  "DataForge",
  "GreenStack",
  "ByteWorks",
  "NexusHub",
  "PixelCraft",
];

const PALESTRA_NOMES = [
  "O Futuro da IA Generativa",
  "Arquitetura Serverless na Prática",
  "Segurança em Aplicações Modernas",
  "Design Systems que Escalam",
];

// Plano de presenças por participante: referencia sessões pelo índice em
// `estandes`/`palestras` (criados na mesma ordem de ESTANDE_NOMES/PALESTRA_NOMES)
// e o dia pelo índice em DIAS. Distribuído propositalmente para exercitar os
// quatro tipos de critério do avaliador de missões (etapa 3) e dar variação
// de pontuação para o ranking.
type PresencaPlano = { tipo: "estande" | "palestra"; indice: number; dia: number };

const PARTICIPANTES_PLANO: { nome: string; email: string; presencas: PresencaPlano[] }[] = [
  {
    nome: "Ana Souza",
    email: "ana.souza@evento.com",
    presencas: [
      { tipo: "palestra", indice: 0, dia: 0 },
      { tipo: "estande", indice: 0, dia: 0 },
      { tipo: "estande", indice: 1, dia: 1 },
    ],
  },
  {
    nome: "Bruno Lima",
    email: "bruno.lima@evento.com",
    presencas: [
      { tipo: "estande", indice: 2, dia: 1 },
      { tipo: "estande", indice: 3, dia: 1 },
      { tipo: "estande", indice: 4, dia: 1 },
    ],
  },
  {
    nome: "Carla Mendes",
    email: "carla.mendes@evento.com",
    presencas: [
      { tipo: "estande", indice: 0, dia: 2 },
      { tipo: "estande", indice: 1, dia: 2 },
      { tipo: "estande", indice: 2, dia: 2 },
      { tipo: "estande", indice: 3, dia: 2 },
      { tipo: "estande", indice: 4, dia: 2 },
    ],
  },
  {
    nome: "Daniel Rocha",
    email: "daniel.rocha@evento.com",
    presencas: [
      { tipo: "estande", indice: 5, dia: 0 },
      { tipo: "estande", indice: 6, dia: 1 },
      { tipo: "palestra", indice: 1, dia: 2 },
    ],
  },
  {
    nome: "Eduarda Alves",
    email: "eduarda.alves@evento.com",
    presencas: [
      { tipo: "estande", indice: 7, dia: 0 },
      { tipo: "palestra", indice: 2, dia: 1 },
      { tipo: "estande", indice: 0, dia: 2 },
      { tipo: "palestra", indice: 3, dia: 3 },
      { tipo: "estande", indice: 1, dia: 4 },
    ],
  },
  {
    nome: "Felipe Torres",
    email: "felipe.torres@evento.com",
    presencas: [
      { tipo: "palestra", indice: 1, dia: 1 },
      { tipo: "palestra", indice: 2, dia: 2 },
    ],
  },
  {
    nome: "Gabriela Nunes",
    email: "gabriela.nunes@evento.com",
    presencas: [
      { tipo: "palestra", indice: 0, dia: 0 },
      { tipo: "palestra", indice: 1, dia: 1 },
      { tipo: "palestra", indice: 3, dia: 3 },
    ],
  },
  {
    nome: "Hugo Batista",
    email: "hugo.batista@evento.com",
    presencas: [{ tipo: "estande", indice: 2, dia: 3 }],
  },
  {
    nome: "Isabela Cardoso",
    email: "isabela.cardoso@evento.com",
    presencas: [
      { tipo: "estande", indice: 3, dia: 0 },
      { tipo: "palestra", indice: 2, dia: 2 },
    ],
  },
  {
    nome: "João Pereira",
    email: "joao.pereira@evento.com",
    presencas: [
      { tipo: "estande", indice: 4, dia: 0 },
      { tipo: "estande", indice: 5, dia: 2 },
      { tipo: "estande", indice: 6, dia: 4 },
    ],
  },
];

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.rankingSnapshot.deleteMany();
  await prisma.missaoDesbloqueada.deleteMany();
  await prisma.presenca.deleteMany();
  await prisma.missao.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.participante.deleteMany();

  console.log("Criando participantes...");
  const senhaHash = await bcrypt.hash("senha123", 10);
  const admin = await prisma.participante.create({
    data: {
      nome: "Admin do Evento",
      email: "admin@evento.com",
      hashSenha: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const participantes = [];
  for (const p of PARTICIPANTES_PLANO) {
    participantes.push(
      await prisma.participante.create({
        data: { nome: p.nome, email: p.email, hashSenha: senhaHash, role: "PARTICIPANTE" },
      }),
    );
  }

  console.log("Criando sessões (estandes e palestras)...");
  const estandes = [];
  for (const nome of ESTANDE_NOMES) {
    estandes.push(
      await prisma.sessao.create({
        data: {
          nome: `Estande ${nome}`,
          tipo: TipoSessao.ESTANDE,
          qrCode: createId(),
          pontosBase: 10,
        },
      }),
    );
  }
  const palestras = [];
  for (const nome of PALESTRA_NOMES) {
    palestras.push(
      await prisma.sessao.create({
        data: {
          nome: `Palestra: ${nome}`,
          tipo: TipoSessao.PALESTRA,
          qrCode: createId(),
          pontosBase: 20,
        },
      }),
    );
  }

  console.log("Criando missões (cobrindo os 4 tipos de critério)...");
  const missoes = await Promise.all([
    prisma.missao.create({
      data: {
        titulo: "Check-in na Palestra de Abertura",
        idSessao: palestras[0]!.id,
        tipoCriterio: "SESSAO_DIRETA",
        parametro: 1,
        pontosBonus: 40,
      },
    }),
    prisma.missao.create({
      data: {
        titulo: "Maratona de Estandes",
        tipoCriterio: "STANDS_POR_DIA",
        parametro: 3,
        pontosBonus: 40,
      },
    }),
    prisma.missao.create({
      data: {
        titulo: "Presença Todos os Dias",
        tipoCriterio: "PRESENCA_DIARIA_STREAK",
        parametro: 3,
        pontosBonus: 40,
      },
    }),
    prisma.missao.create({
      data: {
        titulo: "Fã de Palestras",
        tipoCriterio: "PALESTRAS_TOTAL",
        parametro: 2,
        pontosBonus: 40,
      },
    }),
    prisma.missao.create({
      data: {
        titulo: "Explorador Completo",
        tipoCriterio: "STANDS_POR_DIA",
        parametro: 5,
        pontosBonus: 40,
      },
    }),
  ]);

  console.log("Criando presenças...");
  type PresencaCriada = { idSessao: number; tipoSessao: TipoSessao; pontosBase: number; registradoEm: Date };
  const presencasPorParticipante = new Map<number, PresencaCriada[]>();

  for (let i = 0; i < PARTICIPANTES_PLANO.length; i++) {
    const participante = participantes[i]!;
    const plano = PARTICIPANTES_PLANO[i]!.presencas;
    const criadas: PresencaCriada[] = [];

    for (const item of plano) {
      const sessao = item.tipo === "estande" ? estandes[item.indice]! : palestras[item.indice]!;
      const dia = DIAS[item.dia]!;
      await prisma.presenca.create({
        data: { idParticipante: participante.id, idSessao: sessao.id, registradoEm: dia },
      });
      criadas.push({
        idSessao: sessao.id,
        tipoSessao: sessao.tipo,
        pontosBase: sessao.pontosBase,
        registradoEm: dia,
      });
    }
    presencasPorParticipante.set(participante.id, criadas);
  }

  console.log("Avaliando missões (via lib/missoes/avaliador, mesmo motor da etapa 3)...");
  const pontosPorParticipante = new Map<number, number>();

  for (const participante of participantes) {
    const presencas = presencasPorParticipante.get(participante.id)!;
    const pontosPresencas = presencas.reduce((soma, p) => soma + p.pontosBase, 0);

    const missoesSatisfeitas = avaliarMissoes(presencas, missoes);

    if (missoesSatisfeitas.length > 0) {
      await prisma.missaoDesbloqueada.createMany({
        data: missoesSatisfeitas.map((m) => ({
          idParticipante: participante.id,
          idMissao: m.id,
          desbloqueadaEm: DIAS[4]!,
        })),
        skipDuplicates: true,
      });
    }

    const pontosMissoes = missoesSatisfeitas.reduce((soma, m) => soma + m.pontosBonus, 0);

    pontosPorParticipante.set(participante.id, pontosPresencas + pontosMissoes);
  }

  console.log("Gerando snapshot de ranking do último dia...");
  const ultimoDia = DIAS[4]!;
  const ranking = [...pontosPorParticipante.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] - b[0];
  });

  await prisma.rankingSnapshot.createMany({
    data: ranking.map(([idParticipante, pontos], index) => ({
      idParticipante,
      pontosCalculados: pontos,
      posicao: index + 1,
      dia: ultimoDia,
      geradoEm: ultimoDia,
    })),
  });

  console.log(
    `Seed concluído: ${participantes.length} participantes + 1 admin (${admin.email}), ${estandes.length} estandes, ${palestras.length} palestras, ${missoes.length} missões.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
