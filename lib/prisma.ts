import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Singleton via globalThis: evita multiplicar pools de conexão em hot-reload
// (dev) e em invocações serverless que reaproveitam o mesmo runtime.
//
// DATABASE_URL deve apontar para o Supavisor em transaction mode (porta 6543,
// pgbouncer=true) — ver .env.example.
//
// Sobre PG_POOL_MAX (conexões por pool local): o pressuposto antigo de "uma
// invocação serverless = um pool isolado" não vale aqui. O projeto roda sob
// Fluid Compute na Vercel, que reaproveita a mesma instância para atender
// várias requisições concorrentes no mesmo event loop — ou seja, múltiplas
// transações disputam as MESMAS conexões locais deste pool ao mesmo tempo.
// Se o pool fica pequeno demais, a partir da (PG_POOL_MAX + 1)-ésima
// transação simultânea a requisição espera na fila e estoura o `maxWait` do
// Prisma, resultando em P2028 ("Unable to start a transaction in the given
// time").
//
// O teto real é o Pool Size do Supavisor, que é AGREGADO entre todas as
// instâncias serverless somadas (não por instância). No banco de teste
// (Supabase Free) esse Pool Size é 15; com PG_POOL_MAX = 5 cabem ~3
// instâncias Fluid ativas em pico sem estourar o teto do Supavisor.
//
// TODO: recalcular PG_POOL_MAX quando o Pool Size do Supabase de produção
// (plano Pro, ainda a definir) for confirmado — a conta é
// Pool Size / instâncias Fluid simultâneas esperadas em pico.
const PG_POOL_MAX = 5;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: PG_POOL_MAX,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    transactionOptions: {
      // Folga para absorver picos curtos de concorrência (fila por uma das
      // PG_POOL_MAX conexões locais) sem virar P2028 visível ao participante.
      maxWait: 5000,
      timeout: 10000,
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
