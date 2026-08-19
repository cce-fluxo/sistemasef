import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// `migrate`/`db push`/introspection usam a conexão direta (porta 5432, sem
// pooler) porque Supavisor em transaction mode não suporta bem DDL/prepared
// statements. O runtime da aplicação (lib/prisma.ts) usa DATABASE_URL
// (porta 6543, pgbouncer=true) via driver adapter, não este arquivo.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
