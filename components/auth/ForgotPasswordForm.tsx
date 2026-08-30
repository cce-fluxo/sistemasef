"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRecuperacaoAction } from "@/actions/auth";
import { MailIcon } from "./icons";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(solicitarRecuperacaoAction, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-3xl" aria-hidden>
          📬
        </p>
        <p className="text-sm text-foreground/70">
          Se existir uma conta com esse e-mail, você vai receber um link para redefinir sua senha. O
          link vale por 1 hora.
        </p>
        <p className="text-sm text-foreground/60">Não esqueça de conferir a caixa de spam.</p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-brand-500 hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-foreground/60">
        Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
      </p>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground/70"
        >
          <MailIcon /> E-mail cadastrado
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
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
        {isPending ? "Enviando..." : "Enviar link"}
      </button>

      <Link href="/login" className="text-center text-sm font-semibold text-brand-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
