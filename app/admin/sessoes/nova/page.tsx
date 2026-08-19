import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SessaoForm } from "@/components/admin/SessaoForm";
import { criarSessaoAction } from "@/actions/admin/sessoes";

export const metadata: Metadata = { title: "Nova sessão — Admin" };

export default async function NovaSessaoPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Nova sessão</h1>
      <div className="mt-6">
        <SessaoForm action={criarSessaoAction} />
      </div>
    </div>
  );
}
