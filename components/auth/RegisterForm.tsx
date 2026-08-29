"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { UserIcon, MailIcon, LockIcon } from "./icons";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="nome" className="flex items-center gap-2 text-[13px] font-bold tracking-wider uppercase text-muted">
          <UserIcon /> Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          placeholder="Seu nome completo"
          className="input-field"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="input-field"
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
        className="btn-primary mt-2"
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-extrabold text-brand-500 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
