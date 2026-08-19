# Load testing — fluxo de scan de QR code

Testa quantas requisições simultâneas o fluxo de check-in (participante escaneia
QR code → registra Presença) aguenta, usando [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

## Pré-requisito

Instale o k6: https://grafana.com/docs/k6/latest/set-up/install-k6/

## Duas formas de rodar o teste

### Opção A — Route Handler de load testing (recomendado)

Existe um endpoint temporário só para isso: `app/api/_loadtest/scan/route.ts`.
Ele reaproveita a mesma lógica de negócio da Server Action de check-in
(`lib/checkin/registrar-presenca.ts`) e o mesmo rate limiting do Upstash, mas
recebe `{ qrCode, participanteId }` via JSON — sem precisar de cookie de
sessão nem de capturar hash de Server Action.

Ele só responde se a env var `ENABLE_LOADTEST_ENDPOINT=true` estiver setada no
ambiente de staging (em qualquer outro caso devolve 404). **Nunca habilite essa
env var em produção.**

Para usar essa opção, troque a função `scanQrCode` em `stress-test-qr-scan.js`
pela alternativa comentada no fim do próprio arquivo (chama
`/api/_loadtest/scan` com `fetch`/`http.post` normal em vez de simular uma
Server Action).

### Opção B — Chamando a Server Action diretamente

Mais fiel ao tráfego real, mas exige capturar dados manualmente via DevTools:

1. Abra o app no navegador, DevTools → Network, filtro "Fetch/XHR".
2. Faça um scan de QR code manualmente.
3. Ache a requisição POST (vai para a URL da própria página `/scan`) e copie:
   - O header `Next-Action` (um hash tipo `40a1b2c3...`).
   - Os cookies de sessão — o JWT httpOnly (`session=...`).
4. Escolha um ou mais QR codes de sessões/estandes existentes em staging.

Esses valores expiram: o cookie de sessão tem TTL curto. Se o teste começar a
tomar uma onda de **401** no meio da execução, é sinal de token vencido —
recapture um novo.

## Configuração

```
cp load-tests/.env.loadtest.example load-tests/.env.loadtest
```

Preencha `load-tests/.env.loadtest` com os valores capturados acima
(`BASE_URL`, e dependendo da opção escolhida, `NEXT_ACTION_HASH` +
`SESSION_COOKIE`, ou apenas `QR_CODES`). Esse arquivo nunca é commitado.

## Rodando

```
npm run loadtest:qr-scan
```

Isso carrega `load-tests/.env.loadtest`, confere se o k6 está instalado e roda
`stress-test-qr-scan.js`. Também dá para rodar o k6 direto:

```
k6 run --env BASE_URL=https://seu-evento-staging.vercel.app load-tests/stress-test-qr-scan.js
```

## ⚠️ Avisos importantes

- **Nunca rode contra produção.** Rode sempre contra staging — o teste gera
  registros reais de `Presença` (e desbloqueios de `Missão`) no banco.
- Se aparecer uma onda de **401** no meio do teste (Opção B), o token JWT do
  cookie de sessão expirou; recapture um novo via DevTools e atualize
  `SESSION_COOKIE` em `.env.loadtest`.
- **429** durante o teste é esperado — é o rate limiting do Upstash
  funcionando, não uma falha do sistema.
