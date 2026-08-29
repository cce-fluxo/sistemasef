"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { MailIcon, LockIcon } from "./icons";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted">
          <MailIcon /> E-mail
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

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted">
          <LockIcon /> Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="input-field"
        />
      </div>

      <Link
        href="/recuperar-senha"
        className="-mt-1 self-end text-[13px] font-bold text-gold-400 hover:underline"
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
        className="btn-primary mt-2"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-extrabold text-brand-500 hover:underline">
          Cadastre-se aqui
        </Link>
      </p>
    </form>
  );
}
