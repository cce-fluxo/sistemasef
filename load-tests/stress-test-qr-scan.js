/**
 * k6 Load Test - Fluxo de Scan de QR Code (Presença)
 * ----------------------------------------------------
 * Testa quantas requisições simultâneas seu sistema aguenta no fluxo
 * crítico: participante escaneia QR code -> registra Presença.
 *
 * Usa o Route Handler temporário app/api/loadtest-scan/scan/route.ts,
 * que reaproveita a mesma lógica de negócio (lib/checkin/registrar-presenca.ts)
 * e o mesmo rate limiter da Server Action de check-in, mas recebe
 * { qrCode, participanteId } via JSON -- sem cookie de sessão nem hash de
 * Server Action.
 *
 * Só funciona se, no ambiente de destino:
 *   - ENABLE_LOADTEST_ENDPOINT=true estiver setado (staging/preview); e
 *   - o middleware (proxy.ts) NÃO estiver gateando /api/loadtest-scan
 *     (o matcher precisa isentar esse caminho -- ver proxy.ts).
 * Nunca aponte esse script pra produção: ele grava Presença real e
 * desbloqueia Missão no banco.
 *
 * COMO RODAR (listas de QR codes e participanteIds já vêm embutidas abaixo,
 * geradas pelo seed-loadtest.ts -- 1000 participantes, 20 sessões):
 *
 *   # cenário padrão (vazao_real): ~200 VUs, maximiza check-ins que chegam ao banco
 *   k6 run --env BASE_URL=https://sistemasef021-xxxx-sef14.vercel.app \
 *     load-tests/stress-test-qr-scan.js
 *
 *   # cenário de pico agressivo -- rampa até 500 VUs (muitos 429 esperados):
 *   k6 run --env BASE_URL=https://... --env SCENARIO=pico \
 *     load-tests/stress-test-qr-scan.js
 *
 *   # pico com outro teto de VUs:
 *   k6 run --env BASE_URL=https://... --env SCENARIO=pico --env PICO_VUS=1000 \
 *     load-tests/stress-test-qr-scan.js
 *
 * Dá pra sobrescrever as listas embutidas via --env QR_CODES=a,b,c e
 * --env PARTICIPANTE_IDS=1,2,3.
 *
 * SOBRE PARTICIPANTE_IDS: o rate limiter de check-in é keyado por
 * participanteId (10 scans/60s por participante, sliding window). Uma lista
 * curta de IDs faz o teste bater rate limit artificialmente e mascarar o
 * teste de concorrência real. Por isso o default abaixo tem 1000 IDs reais
 * seedados no banco de teste.
 *
 * SOBRE SATURAÇÃO DE DADOS: 20 sessões x 1000 participantes = 20000 pares
 * (participante, sessão) únicos. Depois que todos forem criados, todo scan
 * passa a retornar { jaRegistrado: true } com status 200 -- continua válido
 * como teste de carga (HTTP + rate limiter + transação de leitura), mas o
 * mix de trabalho de ESCRITA cai. Reseede o banco entre corridas longas se
 * quiser medir o caminho de escrita completo.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ---------- CONFIGURAÇÃO ----------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// QR codes de teste -- tokens reais das 20 sessões seedadas por
// seed-loadtest.ts. Sobrescreva com --env QR_CODES=a,b,c se necessário.
const QR_CODES = (
  __ENV.QR_CODES ||
  [
    'r4xjaawx7neekgpssm',
    'b8u4pnltfukl0cqywnc8',
    '58ygegxrkao490tf8m',
    '6t5fhkqdmxikgolxqkyl',
    'hax0cmnzkcsinsbxwx',
    'l5irtag2kozpsgvk1sz3',
    'l3cdzqa4jh86fhwgdqx',
    'es7ztubhqro4wfdimf',
    'cqfajeybcbsupnc7km',
    'p3pfxwsoxwebnpwuveoz',
    '5wr2413jb3rokb0dhop',
    'uzhgcbwque4fi5tgznur',
    'jkda4jwygt8gpdte6og',
    'pnzztlxetgantfbmsvlt',
    'cstcwwpamunfbgneu5mh',
    'r1frl9gswt4tfkqbxes',
    'qmrii5illjblyskwav',
    'yeobipla4k5l0s0t4cq',
    'qfuk1nlhhifzokq77hc5',
    'tkg0sh6oidqqkwci5iqo',
  ].join(',')
).split(',');

// participanteId reais existentes no banco de teste -- 1000 participantes
// seedados por seed-loadtest.ts. NÃO são contíguos: o autoincrement pulou a
// faixa 301..600 numa corrida anterior, então os IDs reais são [1..300] e
// [601..1300]. Usar um ID inexistente aqui causaria 500 (FK violation no
// upsert de Presenca), inflando a taxa de erro -- por isso a lista é exata.
// Ver aviso acima sobre por que isso não pode ser uma lista curta.
// Sobrescreva com --env PARTICIPANTE_IDS=1,2,3 (ex: se reseedar o banco).
function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
const PARTICIPANTE_IDS = (
  __ENV.PARTICIPANTE_IDS || [...range(1, 300), ...range(601, 1300)].join(',')
)
  .split(',')
  .map(Number);

// ---------- MÉTRICAS CUSTOMIZADAS ----------

const errorRate = new Rate('errors');
const rateLimitedRate = new Rate('rate_limited_429');
const redirectRate = new Rate('proxy_redirect_3xx');
const endpointDisabledRate = new Rate('endpoint_disabled_404');
const scanDuration = new Trend('scan_duration');

// ---------- CENÁRIOS DE CARGA ----------
// Selecione com --env SCENARIO=vazao_real (default) | pico
//
// vazao_real: ~200 VUs sustentados. Com 1000 IDs distintos, mantém a carga
//   por-participante perto do limite do rate limiter (10/60s), maximizando
//   check-ins que realmente chegam ao Postgres (status 200). Mede a vazão
//   de escrita/transação sob concorrência.
//
// pico: rampa até 500 VUs (simula "todo mundo escaneando ao sair da
//   palestra"). Gera centenas de req/s -> a maior parte das respostas vira
//   429. Valida o rate limiter (Upstash) segurando o Postgres sob pico
//   extremo. 429 aqui é comportamento esperado, não falha. Ajuste o topo
//   com --env PICO_VUS=1000. Sob esse pico os thresholds de
//   http_req_duration provavelmente falham -- é informativo (onde dói),
//   não um bug do script.

const SCENARIO = __ENV.SCENARIO || 'vazao_real';
const PICO_VUS = Number(__ENV.PICO_VUS || 500);

const SCENARIOS = {
  vazao_real: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 200 },
      { duration: '3m', target: 200 },
      { duration: '30s', target: 0 },
    ],
  },
  pico: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: Math.round(PICO_VUS * 0.1) },
      { duration: '1m', target: PICO_VUS },
      { duration: '3m', target: PICO_VUS },
      { duration: '30s', target: 0 },
    ],
  },
};

if (!SCENARIOS[SCENARIO]) {
  throw new Error(`SCENARIO inválido: "${SCENARIO}". Use "vazao_real" ou "pico".`);
}

export const options = {
  scenarios: {
    [SCENARIO]: SCENARIOS[SCENARIO],
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // ajuste conforme SLA desejado
    errors: ['rate<0.01'],              // menos de 1% de erro real (5xx / timeout)
    proxy_redirect_3xx: ['rate==0'],    // qualquer 3xx = middleware ainda gateando a rota
    endpoint_disabled_404: ['rate==0'], // qualquer 404 vazio = ENABLE_LOADTEST_ENDPOINT off
    // 429 fica fora de propósito -- rate limit funcionando é esperado, não falha.
  },
};

// ---------- FUNÇÃO PRINCIPAL ----------

export default function () {
  const qrCode = QR_CODES[Math.floor(Math.random() * QR_CODES.length)];
  const participanteId = PARTICIPANTE_IDS[Math.floor(Math.random() * PARTICIPANTE_IDS.length)];

  const res = scanQrCode(qrCode, participanteId);

  const is3xx = res.status >= 300 && res.status < 400;
  // 404 sem corpo JSON = guard ENABLE_LOADTEST_ENDPOINT devolvendo NextResponse(null).
  // 404 com { erro: "QR Code não corresponde..." } = QR inexistente (falha de dado do teste).
  const isEndpointDisabled = res.status === 404 && !String(res.body || '').trim().startsWith('{');

  const ok = check(res, {
    'status 200 ou 429 (não 5xx)': (r) => r.status === 200 || r.status === 429,
    'não deu timeout': (r) => r.status !== 0,
    'proxy não redirecionou (sem 3xx)': () => !is3xx,
    'endpoint de load test habilitado (sem 404 vazio)': () => !isEndpointDisabled,
  });

  errorRate.add(res.status >= 500 || res.status === 0);
  rateLimitedRate.add(res.status === 429);
  redirectRate.add(is3xx);
  endpointDisabledRate.add(isEndpointDisabled);
  scanDuration.add(res.timings.duration);

  if (is3xx) {
    console.error(
      `Recebeu ${res.status} -> ${res.headers['Location'] || '?'}. ` +
        `O middleware (proxy.ts) ainda está gateando /api/loadtest-scan -- ` +
        `o matcher precisa isentar esse caminho.`,
    );
  } else if (isEndpointDisabled) {
    console.error(
      `Recebeu 404 vazio. ENABLE_LOADTEST_ENDPOINT não está "true" no ambiente ${BASE_URL}.`,
    );
  } else if (!ok) {
    console.error(`Falha no scan: status=${res.status} body=${String(res.body || '').slice(0, 200)}`);
  }

  // Pausa curta simulando comportamento humano entre scans.
  sleep(Math.random() * 1.5 + 0.5);
}

// ---------- CHAMADA DO ROUTE HANDLER DE LOAD TEST ----------

function scanQrCode(qrCode, participanteId) {
  return http.post(
    `${BASE_URL}/api/loadtest-scan/scan`,
    JSON.stringify({ qrCode, participanteId }),
    {
      headers: { 'Content-Type': 'application/json' },
      // Não seguir redirect: um 302 -> /login (middleware gateando a rota)
      // viraria um 200 com HTML da tela de login e mascararia a falha.
      redirects: 0,
      tags: { name: 'scanQrCode' },
    }
  );
}
