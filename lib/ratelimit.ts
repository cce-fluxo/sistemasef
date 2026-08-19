import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Instanciação preguiçosa: `Redis.fromEnv()` lança se as env vars do Upstash
// não estiverem setadas, então evitamos chamar isso no top-level do módulo
// (quebraria build/dev sem credenciais reais). Só falha quando uma Server
// Action de mutação de fato tenta aplicar rate limit.
let redis: Redis | undefined;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

const limiters = new Map<string, Ratelimit>();

/**
 * Sliding window por prefixo (ex: "checkin", "auth-login"). Usado em toda
 * Server Action de mutação para proteger o Postgres de picos de escrita sob
 * concorrência serverless.
 */
export function getRatelimiter(prefix: string, limit = 10, windowSeconds = 60): Ratelimit {
  const key = `${prefix}:${limit}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `ratelimit:${prefix}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}
