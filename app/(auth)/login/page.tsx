import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Semana Fluxo — 021",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ "senha-redefinida"?: string }>;
}) {
  const params = await searchParams;
  const senhaRedefinida = params["senha-redefinida"] === "1";

  return (
    <AuthCard title="Entrar" subtitle="Acesse sua conta para continuar">
      {senhaRedefinida && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-success-500/30 bg-success-500/15 px-4 py-3 text-sm font-bold text-success-400"
        >
          ✅ Senha alterada! Entre com a nova senha.
        </p>
      )}
      <LoginForm />
    </AuthCard>
  );
}
