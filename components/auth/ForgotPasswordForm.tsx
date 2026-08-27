"use client";

import { useState } from "react";
import Link from "next/link";
import { MailIcon } from "./icons";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-3xl">📬</p>
        <p className="text-sm text-foreground/70">
          Se existir uma conta para <strong className="text-foreground">{email}</strong>, você vai receber um
          e-mail com instruções para redefinir sua senha.
        </p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-brand-500 hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-4"
    >
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10"
        />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-brand-500 py-3 text-center font-display text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
      >
        Enviar link
      </button>

      <Link href="/login" className="text-center text-sm font-semibold text-brand-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
