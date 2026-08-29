# Load testing — fluxo de scan de QR code

Testa quantas requisições simultâneas o fluxo de check-in (participante escaneia
QR code → registra Presença) aguenta, usando [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

## Pré-requisito

Instale o k6: https://grafana.com/docs/k6/latest/set-up/install-k6/

## Duas formas de rodar o teste

### Opção A — Route Handler de load testing (recomendado, já é o padrão do script)

Existe um endpoint temporário só para isso: `app/api/loadtest-scan/scan/route.ts`.
Ele reaproveita a mesma lógica de negócio da Server Action de check-in
(`lib/checkin/registrar-presenca.ts`) e o mesmo rate limiting do Upstash, mas
recebe `{ qrCode, participanteId }` via JSON — sem precisar de cookie de
sessão nem de capturar hash de Server Action.

Ele só responde se a env var `ENABLE_LOADTEST_ENDPOINT=true` estiver setada no
ambiente de staging (em qualquer outro caso devolve 404). **Nunca habilite essa
env var em produção.** O caminho `/api/loadtest-scan` também precisa estar
isento do gate de sessão no middleware (`proxy.ts`), senão o k6 (sem cookie)
toma `302 → /login` antes de chegar no handler.

O `stress-test-qr-scan.js` já chama `/api/loadtest-scan/scan` direto (POST JSON),
com as listas de QR codes e `participanteId` do seed embutidas como default.
Basta passar `BASE_URL` (e, opcionalmente, `SCENARIO=vazao_real|pico`).

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
(`BASE_URL`; para a Opção B também `NEXT_ACTION_HASH` + `SESSION_COOKIE`).
Esse arquivo nunca é commitado.

Para a Opção A, as listas de QR codes e `participanteId` já vêm embutidas em
`stress-test-qr-scan.js` (geradas pelo `seed-loadtest.ts` — 1000 participantes,
20 sessões; os IDs são `[1..300]` + `[601..1300]`, não contíguos). Se reseedar
o banco, rode o seed de novo e substitua as listas no topo do script, ou passe
`--env QR_CODES=...` / `--env PARTICIPANTE_IDS=...`.

Para adicionar mais participantes sem recriar sessões (subir o teto de VUs):

```
SEED_PARTICIPANTES=2000 SEED_SESSOES=0 SKIP_SAFETY_CHECK=true \
  npx dotenv -e .env.loadtest.local -- npx tsx seed-loadtest.ts
```

## Rodando

```
npm run loadtest:qr-scan
```

Isso carrega `load-tests/.env.loadtest`, confere se o k6 está instalado e roda
`stress-test-qr-scan.js`. Também dá para rodar o k6 direto:

```
# cenário padrão (vazao_real): ~200 VUs, maximiza check-ins que chegam ao banco
k6 run --env BASE_URL=https://seu-evento-staging.vercel.app load-tests/stress-test-qr-scan.js

# cenário de pico: rampa até 500 VUs, muitos 429 esperados
k6 run --env BASE_URL=https://seu-evento-staging.vercel.app --env SCENARIO=pico load-tests/stress-test-qr-scan.js

# pico com outro teto de VUs
k6 run --env BASE_URL=https://seu-evento-staging.vercel.app --env SCENARIO=pico --env PICO_VUS=1000 load-tests/stress-test-qr-scan.js
```

> Com centenas de VUs, rode o k6 numa máquina/VM com recursos suficientes (cada
> VU é uma goroutine + conexões; suba o limite de file descriptors no Linux).
> Sob o `pico` os thresholds de `http_req_duration` provavelmente estouram —
> isso é o teste achando o ponto de dor, não um erro do script.

## ⚠️ Avisos importantes

- **Nunca rode contra produção.** Rode sempre contra staging — o teste gera
  registros reais de `Presença` (e desbloqueios de `Missão`) no banco.
- Se aparecer uma onda de **401** no meio do teste (Opção B), o token JWT do
  cookie de sessão expirou; recapture um novo via DevTools e atualize
  `SESSION_COOKIE` em `.env.loadtest`.
- **429** durante o teste é esperado — é o rate limiting do Upstash
  funcionando, não uma falha do sistema. No cenário `pico` ele domina as
  respostas de propósito.
- Uma onda de **3xx** (redirect para `/login`) significa que o middleware
  (`proxy.ts`) ainda está gateando `/api/loadtest-scan`; ajuste o `matcher`.
- **404** com corpo vazio = `ENABLE_LOADTEST_ENDPOINT` não está `true` no
  ambiente de destino.
