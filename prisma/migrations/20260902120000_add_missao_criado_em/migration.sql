-- AlterTable
ALTER TABLE "missao" ADD COLUMN "criado_em" DATE NOT NULL DEFAULT CURRENT_DATE;

-- Missões que já existem antes desta migration: backdate para uma data
-- anterior a qualquer presença possível (o evento começa em 2026-09-14, ver
-- prisma/seed.ts). Assim elas mantêm o comportamento atual de contar todo o
-- histórico de presenças; só missões criadas a partir de agora nascem com a
-- trava de data valendo (avaliador ignora presenças anteriores a criado_em).
UPDATE "missao" SET "criado_em" = DATE '2000-01-01';
