import "dotenv/config";
import { defineConfig } from "prisma/config";

// `migrate`/`db push`/introspection usam a conexão direta (porta 5432, sem
// pooler) porque Supavisor em transaction mode não suporta bem DDL/prepared
// statements. O runtime da aplicação (lib/prisma.ts) usa DATABASE_URL
// (porta 6543, pgbouncer=true) via driver adapter, não este arquivo.
//
// Lido via process.env em vez do helper `env()` do Prisma: `env()` lança
// PrismaConfigEnvError assim que o arquivo é carregado, o que quebra
// `prisma generate` no build da Vercel (generate não precisa de URL nenhuma).
// Sem DIRECT_URL, cai em DATABASE_URL; sem nenhuma das duas, o datasource é
// omitido e só os comandos de migração reclamam — o build passa.
const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
