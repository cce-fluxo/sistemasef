"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "./icons";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-black/10 bg-surface-muted px-4 py-3 pr-11 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={mostrarSenha}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 transition hover:text-foreground/80"
          >
            {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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
