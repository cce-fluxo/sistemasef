"use client";

import { useActionState } from "react";
import { criarAdministradorAction, type AdminActionState } from "@/actions/admin/admins";

const campoClasse =
  "rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10";

export function NovoAdminForm() {
  const [state, formAction, isPending] = useActionState<AdminActionState | null, FormData>(
    criarAdministradorAction,
    null,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-foreground/70">
          Nome
        </label>
        <input id="nome" name="nome" required className={campoClasse} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground/70">
          E-mail
        </label>
        <input id="email" name="email" type="email" required className={campoClasse} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-foreground/70">
          Senha
        </label>
        <input id="senha" name="senha" type="password" minLength={8} required className={campoClasse} />
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
        {isPending ? "Criando..." : "Criar administrador"}
      </button>
    </form>
  );
}
