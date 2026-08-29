"use client";

import { useActionState } from "react";
import { refreshInscritosAction, type RefreshInscritosState } from "@/actions/admin/inscritos";

export function RefreshInscritosButton() {
  const [state, formAction, isPending] = useActionState<RefreshInscritosState | null, FormData>(
    refreshInscritosAction,
    null,
  );

  return (
    <form action={formAction} className="mt-3">
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500 px-4 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-500/10 disabled:opacity-60 dark:text-brand-400"
      >
        {isPending ? "Atualizando inscritos..." : "Atualizar lista de inscritos"}
      </button>

      {state?.ok === true && (
        <p role="status" className="mt-2 text-center text-xs font-medium text-success-500">
          {state.total} e-mails recarregados no cache.
        </p>
      )}
      {state?.ok === false && (
        <p role="alert" className="mt-2 text-center text-xs font-medium text-red-500">
          {state.erro}
        </p>
      )}
    </form>
  );
}
