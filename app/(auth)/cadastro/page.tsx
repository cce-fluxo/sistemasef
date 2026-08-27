import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta — Evento Gamificado",
};

export default function CadastroPage() {
  return (
    <AuthCard title="Criar conta" subtitle="Cadastre-se para participar do evento">
      <RegisterForm />
    </AuthCard>
  );
}
