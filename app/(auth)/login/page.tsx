import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Semana Fluxo — 021",
};

export default function LoginPage() {
  return (
    <AuthCard title="Entrar" subtitle="Acesse sua conta para continuar">
      <LoginForm />
    </AuthCard>
  );
}
