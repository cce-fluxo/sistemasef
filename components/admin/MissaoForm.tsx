"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/actions/admin/missoes";

const campoClasse =
  "rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10";

const TIPOS_CRITERIO = [
  { valor: "SESSAO_DIRETA", label: "Check-in em sessão específica" },
  { valor: "STANDS_POR_DIA", label: "N estandes no mesmo dia" },
  { valor: "PALESTRAS_POR_DIA", label: "N palestras no mesmo dia" },
  { valor: "PRESENCA_DIARIA_STREAK", label: "N dias distintos com presença" },
  { valor: "PALESTRAS_TOTAL", label: "N palestras no total" },
] as const;

type SessaoOpcao = { id: number; nome: string };

type Props = {
  action: (prevState: AdminActionState | null, formData: FormData) => Promise<AdminActionState>;
  sessoes: SessaoOpcao[];
  valoresIniciais?: {
    titulo: string;
    tipoCriterio: string;
    parametro: number;
    pontosBonus: number;
    idSessao: number | null;
  };
};

export function MissaoForm({ action, sessoes, valoresIniciais }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [tipoCriterio, setTipoCriterio] = useState(valoresIniciais?.tipoCriterio ?? "SESSAO_DIRETA");

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-foreground/70">
          Título
        </label>
        <input id="titulo" name="titulo" defaultValue={valoresIniciais?.titulo} required className={campoClasse} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipoCriterio" className="text-sm font-medium text-foreground/70">
          Critério
        </label>
        <select
          id="tipoCriterio"
          name="tipoCriterio"
          value={tipoCriterio}
          onChange={(e) => setTipoCriterio(e.target.value)}
          className={campoClasse}
        >
          {TIPOS_CRITERIO.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {tipoCriterio === "SESSAO_DIRETA" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="idSessao" className="text-sm font-medium text-foreground/70">
            Sessão
          </label>
          <select
            id="idSessao"
            name="idSessao"
            defaultValue={valoresIniciais?.idSessao ?? ""}
            required
            className={campoClasse}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {sessoes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="parametro" className="text-sm font-medium text-foreground/70">
          Parâmetro
        </label>
        <input
          id="parametro"
          name="parametro"
          type="number"
          min={1}
          defaultValue={valoresIniciais?.parametro ?? 1}
          required
          className={campoClasse}
        />
        <p className="text-xs text-foreground/50">
          {tipoCriterio === "SESSAO_DIRETA"
            ? "Não usado para este critério (mantenha 1)."
            : "Quantidade exigida pelo critério."}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pontosBonus" className="text-sm font-medium text-foreground/70">
          Pontos bônus
        </label>
        <input
          id="pontosBonus"
          name="pontosBonus"
          type="number"
          min={0}
          defaultValue={valoresIniciais?.pontosBonus ?? 40}
          required
          className={campoClasse}
        />
      </div>

      {state?.ok === false && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-brand-500 py-3 font-display font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
