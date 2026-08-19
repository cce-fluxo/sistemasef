"use client";

import { useState } from "react";

// Conteúdo estático — sem tabela nova no banco. A agenda real depende de
// dados de horário/local que não existem no modelo (Sessao só tem nome,
// tipo, qr_code, pontos_base). Placeholder até a organização definir como
// esses dados serão mantidos.
type Categoria = "Abertura" | "Palestra" | "Estande" | "Encerramento";

const CATEGORIA_STYLE: Record<Categoria, string> = {
  Abertura: "bg-gold-400/20 text-gold-500",
  Palestra: "bg-info-500/20 text-info-500",
  Estande: "bg-brand-500/20 text-brand-500",
  Encerramento: "bg-success-500/20 text-success-500",
};

type AgendaItem = { hora: string; titulo: string; local: string; categoria: Categoria };

const DIAS: { label: string; data: string; itens: AgendaItem[] }[] = [
  {
    label: "DIA 1",
    data: "31/08",
    itens: [
      { hora: "09:00", titulo: "Cerimônia de abertura", local: "Auditório principal", categoria: "Abertura" },
      { hora: "10:30", titulo: "Palestra de boas-vindas", local: "Auditório principal", categoria: "Palestra" },
      { hora: "14:00", titulo: "Abertura da feira de estandes", local: "Praça central", categoria: "Estande" },
    ],
  },
  {
    label: "DIA 2",
    data: "01/09",
    itens: [
      { hora: "10:00", titulo: "Palestra: tema do dia 2", local: "Sala A101", categoria: "Palestra" },
      { hora: "14:00", titulo: "Feira de estandes aberta", local: "Praça central", categoria: "Estande" },
    ],
  },
  {
    label: "DIA 3",
    data: "02/09",
    itens: [
      { hora: "10:00", titulo: "Palestra: tema do dia 3", local: "Sala A101", categoria: "Palestra" },
      { hora: "14:00", titulo: "Feira de estandes aberta", local: "Praça central", categoria: "Estande" },
    ],
  },
  {
    label: "DIA 4",
    data: "03/09",
    itens: [
      { hora: "10:00", titulo: "Palestra: tema do dia 4", local: "Sala A101", categoria: "Palestra" },
      { hora: "14:00", titulo: "Feira de estandes aberta", local: "Praça central", categoria: "Estande" },
    ],
  },
  {
    label: "DIA 5",
    data: "04/09",
    itens: [
      { hora: "14:00", titulo: "Última chance na feira de estandes", local: "Praça central", categoria: "Estande" },
      { hora: "17:00", titulo: "Cerimônia de encerramento", local: "Auditório principal", categoria: "Encerramento" },
    ],
  },
];

export default function AgendaPage() {
  const [diaAtivo, setDiaAtivo] = useState(0);
  const dia = DIAS[diaAtivo]!;

  return (
    <div>
      <header className="header-gradient-gold px-6 pb-6 pt-8 text-navy-950">
        <p className="text-sm font-medium uppercase tracking-wide text-navy-950/70">Agenda</p>
        <h1 className="mt-1 font-display text-2xl font-bold">Cronograma do evento</h1>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-black/5 px-6 py-3 dark:border-white/5">
        {DIAS.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onClick={() => setDiaAtivo(i)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              i === diaAtivo
                ? "bg-brand-500 text-white"
                : "bg-surface-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            {d.label} · {d.data}
          </button>
        ))}
      </nav>

      <main className="flex flex-col gap-3 px-6 py-6">
        {dia.itens.map((item) => (
          <div
            key={`${dia.label}-${item.hora}-${item.titulo}`}
            className="flex gap-4 rounded-2xl border border-black/5 bg-surface p-4 shadow-sm dark:border-white/5"
          >
            <span className="w-14 shrink-0 text-sm font-semibold text-foreground/60">{item.hora}</span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground">{item.titulo}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORIA_STYLE[item.categoria]}`}
                >
                  {item.categoria}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/60">{item.local}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
