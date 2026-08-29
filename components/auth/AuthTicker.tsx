import { Ticker } from "@/components/Ticker";

const TICKER_ITEMS = [
  "SEMANA FLUXO 021",
  "NOSSO JEITO DE FAZER O AMANHÃ",
  "DDD 021",
  "A RUA É A NOSSA ESCOLA",
  "CHECK-IN ✦ MISSÕES ✦ RANKING",
];

export function AuthTicker() {
  return <Ticker items={TICKER_ITEMS} />;
}
