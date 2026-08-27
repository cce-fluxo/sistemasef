import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar senha — Evento Gamificado",
};

export default function RecuperarSenhaPage() {
  return (
    <AuthCard title="Recuperar acesso" subtitle="Vamos te ajudar a voltar a entrar">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
