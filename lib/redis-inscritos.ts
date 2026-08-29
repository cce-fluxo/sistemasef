import { Redis } from "@upstash/redis";
import { fetchInscritosEmails, normalizarEmail } from "@/lib/sheets";

// Mesma instanciação preguiçosa de lib/ratelimit.ts: `Redis.fromEnv()` lança
// se as env vars do Upstash não estiverem setadas, então só resolvemos o
// client quando alguém de fato usa o cache (evita quebrar build/dev sem
// credenciais).
let redis: Redis | undefined;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

// Set com os e-mails inscritos na Semana Fluxo. Recarregado inteiro pelo cron
// a cada 5 min; o TTL de 15 min é margem de segurança — se o cron falhar
// algumas vezes seguidas a chave expira e o próximo cadastro dispara um
// refresh sob demanda em vez de servir dado velho indefinidamente.
const CHAVE = "inscritos:emails";
const TTL_SEGUNDOS = 15 * 60;

// SADD em lotes: ~6.000 membros de uma vez estouraria o limite de tamanho de
// request do Upstash REST.
const LOTE_SADD = 1000;

/**
 * Recarrega o Set inteiro no Redis a partir da planilha, num pipeline
 * (del + sadd + expire), e devolve a contagem de e-mails carregados. O `del`
 * antes do `sadd` garante que e-mails removidos da planilha somem do cache.
 */
export async function refreshInscritosCache(): Promise<number> {
  const emails = await fetchInscritosEmails();
  const lista = [...emails];

  const pipe = getRedis().pipeline();
  pipe.del(CHAVE);
  for (let i = 0; i < lista.length; i += LOTE_SADD) {
    // sadd(key, member, ...members) exige ao menos um membro fora do spread.
    const [primeiro, ...resto] = lista.slice(i, i + LOTE_SADD);
    if (primeiro !== undefined) pipe.sadd(CHAVE, primeiro, ...resto);
  }
  pipe.expire(CHAVE, TTL_SEGUNDOS);
  await pipe.exec();

  return lista.length;
}

/**
 * `true` se o e-mail (após normalização) está na lista de inscritos. Se a
 * chave não existir no Redis (cache frio: TTL expirou ou primeiro acesso
 * antes do primeiro cron), recarrega a partir da planilha antes de checar.
 */
export async function isEmailInscrito(email: string): Promise<boolean> {
  const alvo = normalizarEmail(email);
  const client = getRedis();

  if (!(await client.exists(CHAVE))) {
    await refreshInscritosCache();
  }

  return (await client.sismember(CHAVE, alvo)) === 1;
}
