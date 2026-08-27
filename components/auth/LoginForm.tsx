"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { MailIcon, LockIcon } from "./icons";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
          <MailIcon /> E-mail
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
          <LockIcon /> Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10"
        />
      </div>

      <Link
        href="/recuperar-senha"
        className="-mt-2 self-end text-xs font-semibold text-brand-500 hover:underline"
      >
        Esqueci minha senha
      </Link>

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
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-foreground/70">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-500 hover:underline">
          Cadastre-se aqui
        </Link>
      </p>
    </form>
  );
}
