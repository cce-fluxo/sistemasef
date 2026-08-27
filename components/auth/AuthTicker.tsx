import { Ticker } from "@/components/Ticker";

const TICKER_ITEMS = ["EVENTO GAMIFICADO", "CHECK-IN • MISSÕES • RANKING", "5 DIAS DE EVENTO", "ESCANEIE E PONTUE"];

export function AuthTicker() {
  return <Ticker items={TICKER_ITEMS} />;
}
