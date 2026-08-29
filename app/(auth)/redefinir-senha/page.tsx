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
        <p className="text-sm text-muted">
          Abra o link exatamente como ele veio no e-mail. Se ele já expirou, peça um novo.
        </p>
        <Link
          href="/recuperar-senha"
          className="btn-primary mt-5 block text-center"
        >
          Pedir novo link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Criar nova senha" subtitle="Escolha uma senha de no mínimo 8 caracteres">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
