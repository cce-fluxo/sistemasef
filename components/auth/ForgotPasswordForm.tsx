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
        <p className="text-sm text-muted">
          Se existir uma conta com esse e-mail, você vai receber um link para redefinir sua senha. O link vale por 1
          hora.
        </p>
        <p className="text-sm text-faint">Não esqueça de conferir a caixa de spam.</p>
        <Link href="/login" className="mt-2 text-sm font-extrabold text-brand-500 hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted">
          <MailIcon /> E-mail cadastrado
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="input-field"
        />
      </div>

      {state?.ok === false && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.erro}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary mt-2">
        {isPending ? "Enviando..." : "Enviar link"}
      </button>

      <Link href="/login" className="text-center text-sm font-extrabold text-brand-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
