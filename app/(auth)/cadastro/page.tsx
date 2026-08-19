import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta — Evento Gamificado",
};

export default function CadastroPage() {
  return <RegisterForm />;
}
