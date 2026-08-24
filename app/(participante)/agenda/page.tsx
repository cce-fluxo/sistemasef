import type { Metadata } from "next";
import { getAgenda } from "@/lib/dados/agenda";
import { AgendaTabs } from "@/components/agenda/AgendaTabs";

export const metadata: Metadata = { title: "Agenda — Evento Gamificado" };

export default async function AgendaPage() {
  const dias = await getAgenda();

  return (
    <div>
      <header className="header-gradient-gold px-6 pb-6 pt-8 text-navy-950">
        <p className="text-sm font-medium uppercase tracking-wide text-navy-950/70">Agenda</p>
        <h1 className="mt-1 font-display text-2xl font-bold">Cronograma do evento</h1>
      </header>

      {dias.length === 0 ? (
        <p className="px-6 py-6 text-sm text-foreground/60">A agenda ainda não foi divulgada.</p>
      ) : (
        <AgendaTabs dias={dias} />
      )}
    </div>
  );
}
