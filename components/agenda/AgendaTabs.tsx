"use client";

import { useState } from "react";
import type { AgendaDia } from "@/lib/dados/agenda";

// Cores por categoria vindas do protótipo (Figma): palestra em azul,
// estande em laranja de marca.
const CATEGORIA_COR = {
  ESTANDE: "#E8521A",
  PALESTRA: "#4A5FCE",
} as const;

const CATEGORIA_LABEL = {
  ESTANDE: "ESTANDE",
  PALESTRA: "PALESTRA",
} as const;

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"] as const;

// A data vem como "AAAA-MM-DD" (UTC) — montamos com Date.UTC e lemos em UTC
// para não deslocar o dia da semana em fusos negativos como o de Brasília.
function partesData(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number) as [number, number, number];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return {
    semana: DIAS_SEMANA[d.getUTCDay()]!,
    curta: `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`,
  };
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export function AgendaTabs({ dias }: { dias: AgendaDia[] }) {
  const [diaAtivo, setDiaAtivo] = useState(0);
  const dia = dias[diaAtivo]!;

  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-line bg-background-alt">
        <div className="mx-auto flex max-w-[1100px] overflow-x-auto px-5">
          {dias.map((d, i) => {
            const { semana, curta } = partesData(d.data);
            const ativo = i === diaAtivo;
            return (
              <button
                key={d.data}
                type="button"
                onClick={() => setDiaAtivo(i)}
                aria-current={ativo ? "true" : undefined}
                className={`flex min-w-16 flex-none basis-1/5 flex-col items-center gap-0.5 border-b-[3px] px-1 py-3 transition ${
                  ativo ? "border-gold-400" : "border-transparent"
                }`}
              >
                <span
                  className={`font-heading text-xs font-bold tracking-wider uppercase ${
                    ativo ? "text-gold-400" : "text-faint"
                  }`}
                >
                  {semana}
                </span>
                <span className={`text-[13px] font-extrabold ${ativo ? "text-foreground" : "text-faint"}`}>
                  {curta}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="px-5 py-6">
        {dia.itens.length === 0 ? (
          <p className="px-5 py-15 text-center text-faint">Programação em breve!</p>
        ) : (
          <div className="relative">
            {/* Linha vertical da timeline, alinhada ao centro dos marcadores. */}
            <div className="absolute top-0 bottom-0 left-[56px] w-0.5 bg-line" aria-hidden />

            <div className="flex flex-col">
              {dia.itens.map((item) => {
                const cor = CATEGORIA_COR[item.categoria];
                return (
                  <div key={item.id} className="mb-5 flex items-start">
                    <div className="w-13 shrink-0 pt-3.5 pr-4 text-right">
                      <span className="font-heading text-sm font-bold text-gold-400">{item.horario ?? ""}</span>
                    </div>
                    <div className="relative shrink-0 pt-[17px]">
                      <span
                        className="block h-3 w-3 rounded-full border-2 border-background"
                        style={{ background: cor }}
                        aria-hidden
                      />
                    </div>
                    <div
                      className="ml-4 flex-1 rounded-2xl border border-l-[3px] bg-surface px-4 py-3.5"
                      style={{ borderColor: `${cor}30`, borderLeftColor: cor }}
                    >
                      <div className="flex items-start gap-2">
                        <h3 className="flex-1 text-[15px] leading-snug font-extrabold text-foreground">
                          {item.titulo}
                        </h3>
                        <span
                          className="shrink-0 rounded-md px-2 py-1 font-heading text-[10px] font-bold tracking-wider"
                          style={{ background: `${cor}25`, color: cor }}
                        >
                          {CATEGORIA_LABEL[item.categoria]}
                        </span>
                      </div>
                      {item.local && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-faint">
                          <MapPinIcon />
                          {item.local}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 font-heading text-xs tracking-[0.1em] uppercase text-faint">Legenda</p>
          <div className="flex flex-wrap gap-2.5">
            {(Object.keys(CATEGORIA_COR) as (keyof typeof CATEGORIA_COR)[]).map((categoria) => (
              <span key={categoria} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CATEGORIA_COR[categoria] }}
                  aria-hidden
                />
                <span className="text-xs font-bold text-muted">{CATEGORIA_LABEL[categoria]}</span>
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
