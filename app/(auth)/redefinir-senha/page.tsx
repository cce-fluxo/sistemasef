import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nova senha — Evento Gamificado",
};

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // O token só é validado de fato na Server Action — aqui a checagem é só
  // para não mostrar um formulário inútil a quem abriu a URL sem o link.
  if (!token) {
    return (
      <AuthCard title="Link inválido" subtitle="Não encontramos o código de redefinição">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground/60">
            Abra o link exatamente como ele veio no e-mail. Se ele já expirou, peça um novo.
          </p>
          <Link
            href="/recuperar-senha"
            className="rounded-xl bg-brand-500 py-3 text-center font-display text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            Pedir novo link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Criar nova senha" subtitle="Escolha uma senha de no mínimo 8 caracteres">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
