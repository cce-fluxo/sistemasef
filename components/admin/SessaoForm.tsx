"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/actions/admin/sessoes";

const campoClasse =
  "rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10";

type Props = {
  action: (prevState: AdminActionState | null, formData: FormData) => Promise<AdminActionState>;
  valoresIniciais?: { nome: string; tipo: "ESTANDE" | "PALESTRA"; pontosBase: number };
  qrCode?: string;
};

export function SessaoForm({ action, valoresIniciais, qrCode }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-foreground/70">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={valoresIniciais?.nome}
          required
          className={campoClasse}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className="text-sm font-medium text-foreground/70">
          Tipo
        </label>
        <select id="tipo" name="tipo" defaultValue={valoresIniciais?.tipo ?? "ESTANDE"} className={campoClasse}>
          <option value="ESTANDE">Estande</option>
          <option value="PALESTRA">Palestra</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pontosBase" className="text-sm font-medium text-foreground/70">
          Pontos base
        </label>
        <input
          id="pontosBase"
          name="pontosBase"
          type="number"
          min={0}
          defaultValue={valoresIniciais?.pontosBase ?? 10}
          required
          className={campoClasse}
        />
      </div>

      {qrCode && (
        <div className="rounded-xl border border-black/10 p-3 text-sm text-foreground/60 dark:border-white/10">
          Código QR: <code className="font-mono text-foreground">{qrCode}</code>
          <p className="mt-0.5 text-xs">Gerado automaticamente na criação — não é editável.</p>
        </div>
      )}

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
