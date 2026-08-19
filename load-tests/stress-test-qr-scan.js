/**
 * k6 Load Test - Fluxo de Scan de QR Code (Presença)
 * ----------------------------------------------------
 * Testa quantas requisições simultâneas seu sistema aguenta no fluxo
 * crítico: participante escaneia QR code -> Server Action registra Presença.
 *
 * COMO CAPTURAR OS DADOS REAIS DA SERVER ACTION (obrigatório antes de rodar):
 * 1. Abra o app no navegador, DevTools > Network, filtro "Fetch/XHR"
 * 2. Faça um scan de QR code manualmente
 * 3. Encontre a requisição POST (vai para a URL da própria página)
 * 4. Copie:
 *    - O header "Next-Action" (um hash tipo "40a1b2c3...")
 *    - O body enviado (formato RSC, geralmente algo como [{"...":"..."}])
 *    - Os cookies de sessão (o JWT httpOnly do login)
 * 5. Preencha as constantes abaixo com esses valores
 *
 * ALTERNATIVA MAIS SIMPLES: peça pro Claude Code criar um Route Handler
 * temporário em /app/api/_loadtest/scan/route.ts que chama a mesma
 * Server Action por baixo, recebendo { qrCode, participanteId } via JSON.
 * Aí você troca a função `scanQrCode` abaixo por uma chamada REST normal
 * (fica muito mais simples de manter o script).
 *
 * COMO RODAR:
 *   k6 run stress-test-qr-scan.js
 *   k6 run --env BASE_URL=https://seu-evento.vercel.app stress-test-qr-scan.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ---------- CONFIGURAÇÃO ----------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PAGE_PATH = '/scan'; // ajuste para a rota real onde o scan acontece

// Preencha via env vars na hora de rodar (NÃO deixe valores reais hardcoded aqui --
// esse arquivo pode ser commitado). Ver instruções de captura no topo do arquivo.
//
// Exemplo de execução:
//   k6 run \
//     --env NEXT_ACTION_HASH=40776a4c291b5710521790b57adff085b286405bcf \
//     --env SESSION_COOKIE="session=eyJhbGciOiJIUzI1NiJ9...." \
//     --env QR_CODES=p3q0hcw9lpd6fv766qb8rrhj,outroQrCode,maisUmQrCode \
//     stress-test-qr-scan.js
//
// Dica: salve esses valores num arquivo .env.loadtest (fora do git) e exporte antes de rodar,
// pra não precisar digitar toda vez. O token JWT expira (confira o "exp" no payload) --
// se o teste começar a tomar 401 em massa, é sinal de token vencido; capture um novo.
const NEXT_ACTION_HASH = __ENV.NEXT_ACTION_HASH || 'COLOQUE_O_HASH_AQUI';
const SESSION_COOKIE = __ENV.SESSION_COOKIE || 'COLOQUE_O_COOKIE_JWT_AQUI';

// Lista de QR codes de teste (idealmente sessões/estandes reais de um ambiente de staging).
// Passe vários separados por vírgula via env var pra simular carga distribuída entre
// estandes/palestras diferentes, não só um único ponto.
const QR_CODES = (__ENV.QR_CODES || 'QR-STAND-01,QR-STAND-02,QR-STAND-03,QR-TALK-01').split(',');

// ---------- MÉTRICAS CUSTOMIZADAS ----------

const errorRate = new Rate('errors');
const rateLimitedRate = new Rate('rate_limited_429');
const scanDuration = new Trend('scan_duration');

// ---------- CENÁRIO DE CARGA ----------
// Ajuste os estágios conforme o pico esperado no evento.
// Exemplo: 500 participantes escaneando em ~2min após uma palestra terminar.

export const options = {
  scenarios: {
    ramp_up_scan_burst: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },   // aquecimento
        { duration: '1m', target: 300 },   // sobe até carga alvo
        { duration: '2m', target: 300 },   // sustenta o pico (simula "todo mundo escaneando ao sair da palestra")
        { duration: '30s', target: 0 },    // desce
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // ajuste conforme SLA desejado
    errors: ['rate<0.01'],           // menos de 1% de erro real (5xx)
    // 429 não entra aqui de propósito -- rate limit funcionando é esperado, não é falha
  },
};

// ---------- FUNÇÃO PRINCIPAL ----------

export default function () {
  const qrCode = QR_CODES[Math.floor(Math.random() * QR_CODES.length)];

  const res = scanQrCode(qrCode);

  const ok = check(res, {
    'status é 200 ou 429 (não 5xx)': (r) => r.status === 200 || r.status === 429,
    'não deu timeout': (r) => r.status !== 0,
  });

  errorRate.add(res.status >= 500 || res.status === 0);
  rateLimitedRate.add(res.status === 429);
  scanDuration.add(res.timings.duration);

  if (!ok) {
    console.error(`Falha no scan: status=${res.status} body=${res.body?.slice(0, 200)}`);
  }

  // Pausa curta simulando comportamento humano entre scans (não é bot martelando sem parar)
  sleep(Math.random() * 1.5 + 0.5);
}

// ---------- CHAMADA DA SERVER ACTION ----------

function scanQrCode(qrCode) {
  const params = {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      'Next-Action': NEXT_ACTION_HASH,
      'Cookie': SESSION_COOKIE,
    },
    tags: { name: 'scanQrCode' },
  };

  // O formato exato do body depende de como o Next.js serializa os argumentos
  // da Server Action. Copie o body real capturado no DevTools e ajuste aqui,
  // trocando o valor do QR code pela variável `qrCode`.
  const body = JSON.stringify([qrCode]);

  return http.post(`${BASE_URL}${PAGE_PATH}`, body, params);
}

/**
 * SE VOCÊ OPTAR PELO ROUTE HANDLER TEMPORÁRIO (recomendado para simplicidade):
 *
 * function scanQrCode(qrCode) {
 *   return http.post(`${BASE_URL}/api/_loadtest/scan`, JSON.stringify({
 *     qrCode,
 *     participanteId: Math.floor(Math.random() * 1000) + 1,
 *   }), {
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 * }
 */
