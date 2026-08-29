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

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted">
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
          className="input-field"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmacao"
          className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted"
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
          className="input-field"
        />
      </div>

      {state?.ok === false && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.erro}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Salvando..." : "Salvar nova senha"}
      </button>

      <Link href="/login" className="text-center text-sm font-extrabold text-brand-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
