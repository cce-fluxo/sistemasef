-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "tipo_sessao" AS ENUM ('ESTANDE', 'PALESTRA');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('PARTICIPANTE', 'ADMIN');

-- CreateTable
CREATE TABLE "participante" (
    "id_participante" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "hash_senha" VARCHAR(255) NOT NULL,
    "role" "role" NOT NULL DEFAULT 'PARTICIPANTE',

    CONSTRAINT "participante_pkey" PRIMARY KEY ("id_participante")
);

-- CreateTable
CREATE TABLE "sessao" (
    "id_sessao" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "tipo_sessao" NOT NULL,
    "qr_code" VARCHAR(255) NOT NULL,
    "pontos_base" INTEGER NOT NULL,

    CONSTRAINT "sessao_pkey" PRIMARY KEY ("id_sessao")
);

-- CreateTable
CREATE TABLE "presenca" (
    "id_presenca" SERIAL NOT NULL,
    "id_participante" INTEGER NOT NULL,
    "id_sessao" INTEGER NOT NULL,
    "registrado_em" DATE NOT NULL,

    CONSTRAINT "presenca_pkey" PRIMARY KEY ("id_presenca")
);

-- CreateTable
CREATE TABLE "missao" (
    "id_missao" SERIAL NOT NULL,
    "id_sessao" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "pontos_bonus" INTEGER NOT NULL,
    "tipo_criterio" VARCHAR(255) NOT NULL,
    "parametro" INTEGER NOT NULL,

    CONSTRAINT "missao_pkey" PRIMARY KEY ("id_missao")
);

-- CreateTable
CREATE TABLE "missao_desbloqueada" (
    "id_missao_desbloqueada" SERIAL NOT NULL,
    "id_participante" INTEGER NOT NULL,
    "id_missao" INTEGER NOT NULL,
    "desbloqueada_em" DATE NOT NULL,

    CONSTRAINT "missao_desbloqueada_pkey" PRIMARY KEY ("id_missao_desbloqueada")
);

-- CreateTable
CREATE TABLE "ranking_snapshot" (
    "id_ranking" SERIAL NOT NULL,
    "id_participante" INTEGER NOT NULL,
    "pontos_calculados" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,
    "dia" DATE NOT NULL,
    "gerado_em" DATE NOT NULL,

    CONSTRAINT "ranking_snapshot_pkey" PRIMARY KEY ("id_ranking")
);

-- CreateIndex
CREATE UNIQUE INDEX "participante_email_key" ON "participante"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessao_qr_code_key" ON "sessao"("qr_code");

-- CreateIndex
CREATE INDEX "sessao_qr_code_idx" ON "sessao"("qr_code");

-- CreateIndex
CREATE INDEX "presenca_id_sessao_idx" ON "presenca"("id_sessao");

-- CreateIndex
CREATE INDEX "presenca_id_participante_idx" ON "presenca"("id_participante");

-- CreateIndex
CREATE INDEX "presenca_registrado_em_idx" ON "presenca"("registrado_em");

-- CreateIndex
CREATE UNIQUE INDEX "presenca_id_participante_id_sessao_key" ON "presenca"("id_participante", "id_sessao");

-- CreateIndex
CREATE UNIQUE INDEX "missao_desbloqueada_id_participante_id_missao_key" ON "missao_desbloqueada"("id_participante", "id_missao");

-- CreateIndex
CREATE INDEX "ranking_snapshot_dia_idx" ON "ranking_snapshot"("dia");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_snapshot_id_participante_dia_key" ON "ranking_snapshot"("id_participante", "dia");

-- AddForeignKey
ALTER TABLE "presenca" ADD CONSTRAINT "presenca_id_participante_fkey" FOREIGN KEY ("id_participante") REFERENCES "participante"("id_participante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca" ADD CONSTRAINT "presenca_id_sessao_fkey" FOREIGN KEY ("id_sessao") REFERENCES "sessao"("id_sessao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missao" ADD CONSTRAINT "missao_id_sessao_fkey" FOREIGN KEY ("id_sessao") REFERENCES "sessao"("id_sessao") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missao_desbloqueada" ADD CONSTRAINT "missao_desbloqueada_id_participante_fkey" FOREIGN KEY ("id_participante") REFERENCES "participante"("id_participante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missao_desbloqueada" ADD CONSTRAINT "missao_desbloqueada_id_missao_fkey" FOREIGN KEY ("id_missao") REFERENCES "missao"("id_missao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_snapshot" ADD CONSTRAINT "ranking_snapshot_id_participante_fkey" FOREIGN KEY ("id_participante") REFERENCES "participante"("id_participante") ON DELETE CASCADE ON UPDATE CASCADE;
