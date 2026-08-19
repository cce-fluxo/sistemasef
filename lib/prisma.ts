import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Singleton via globalThis: evita multiplicar pools de conexão em hot-reload
// (dev) e em invocações serverless que reaproveitam o mesmo runtime.
//
// DATABASE_URL deve apontar para o Supavisor em transaction mode (porta 6543,
// pgbouncer=true) — ver .env.example. `max` conservador porque cada
// invocação serverless abre seu próprio pool; o pooler do Supabase é quem
// protege o Postgres de exaustão de conexões, não o pool local em si.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 3,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
