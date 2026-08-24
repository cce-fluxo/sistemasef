"use client";

import { useState } from "react";
import type { AgendaDia } from "@/lib/dados/agenda";

const CATEGORIA_STYLE = {
  ESTANDE: "bg-brand-500/20 text-brand-500",
  PALESTRA: "bg-info-500/20 text-info-500",
} as const;

const CATEGORIA_LABEL = {
  ESTANDE: "Estande",
  PALESTRA: "Palestra",
} as const;

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-") as [string, string, string];
  return `${dia}/${mes}/${ano.slice(2)}`;
}

export function AgendaTabs({ dias }: { dias: AgendaDia[] }) {
  const [diaAtivo, setDiaAtivo] = useState(0);
  const dia = dias[diaAtivo]!;

  return (
    <>
      <nav className="flex gap-2 overflow-x-auto border-b border-black/5 px-6 py-3 dark:border-white/5">
        {dias.map((d, i) => (
          <button
            key={d.data}
            type="button"
            onClick={() => setDiaAtivo(i)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              i === diaAtivo
                ? "bg-brand-500 text-white"
                : "bg-surface-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            {formatarData(d.data)}
          </button>
        ))}
      </nav>

      <main className="flex flex-col gap-3 px-6 py-6">
        {dia.itens.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-2xl border border-black/5 bg-surface p-4 shadow-sm dark:border-white/5"
          >
            <span className="w-14 shrink-0 text-sm font-semibold text-foreground/60">{item.horario ?? ""}</span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground">{item.titulo}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORIA_STYLE[item.categoria]}`}
                >
                  {CATEGORIA_LABEL[item.categoria]}
                </span>
              </div>
              {item.local && <p className="mt-1 text-sm text-foreground/60">{item.local}</p>}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
