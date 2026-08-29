-- CreateTable
CREATE TABLE "token_recuperacao_senha" (
    "id_token" SERIAL NOT NULL,
    "id_participante" INTEGER NOT NULL,
    "hash_token" VARCHAR(64) NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "usado_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_recuperacao_senha_pkey" PRIMARY KEY ("id_token")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_recuperacao_senha_hash_token_key" ON "token_recuperacao_senha"("hash_token");

-- CreateIndex
CREATE INDEX "token_recuperacao_senha_id_participante_idx" ON "token_recuperacao_senha"("id_participante");

-- AddForeignKey
ALTER TABLE "token_recuperacao_senha" ADD CONSTRAINT "token_recuperacao_senha_id_participante_fkey" FOREIGN KEY ("id_participante") REFERENCES "participante"("id_participante") ON DELETE CASCADE ON UPDATE CASCADE;
