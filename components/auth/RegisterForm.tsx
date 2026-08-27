"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { UserIcon, MailIcon, LockIcon } from "./icons";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
          <UserIcon /> Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          placeholder="Seu nome completo"
          className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
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
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-foreground/70">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
