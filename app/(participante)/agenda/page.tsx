import type { Metadata } from "next";
import { getAgenda } from "@/lib/dados/agenda";
import { AgendaTabs } from "@/components/agenda/AgendaTabs";

export const metadata: Metadata = { title: "Agenda — Evento Gamificado" };

// O subtítulo do cabeçalho é derivado da própria agenda (primeiro e último
// dia cadastrados), nunca de um intervalo fixo no código.
function periodoDoEvento(datas: string[]): string | null {
  const primeira = datas[0];
  const ultima = datas[datas.length - 1];
  if (!primeira || !ultima) return null;

  const formatar = (data: string, comAno: boolean) => {
    const [ano, mes, dia] = data.split("-").map(Number) as [number, number, number];
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      ...(comAno ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(new Date(Date.UTC(ano, mes - 1, dia)));
  };

  if (primeira === ultima) return formatar(primeira, true);
  return `${formatar(primeira, false)} a ${formatar(ultima, true)}`;
}

export default async function AgendaPage() {
  const dias = await getAgenda();
  const periodo = periodoDoEvento(dias.map((d) => d.data));

  return (
    <div>
      <header className="header-gradient-gold px-5 pt-12 pb-7 text-navy-950">
        <h1 className="font-display text-4xl leading-none uppercase">Cronograma</h1>
        {periodo && <p className="mt-1.5 text-sm font-semibold text-navy-950/70">{periodo}</p>}
      </header>

      {dias.length === 0 ? (
        <p className="px-5 py-15 text-center text-faint">A agenda ainda não foi divulgada.</p>
      ) : (
        <AgendaTabs dias={dias} />
      )}
    </div>
  );
}
