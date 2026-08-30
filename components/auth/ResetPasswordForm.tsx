"use client";

import { useActionState } from "react";
import Link from "next/link";
import { redefinirSenhaAction } from "@/actions/auth";
import { LockIcon } from "./icons";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(redefinirSenhaAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
          <LockIcon /> Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmacao"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground/70"
        >
          <LockIcon /> Confirmar senha
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repita a nova senha"
          className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10"
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
        className="mt-2 rounded-xl bg-brand-500 py-3 text-center font-display text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar nova senha"}
      </button>

      <Link href="/login" className="text-center text-sm font-semibold text-brand-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
