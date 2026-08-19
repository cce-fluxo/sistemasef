import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SessaoForm } from "@/components/admin/SessaoForm";
import { atualizarSessaoAction } from "@/actions/admin/sessoes";

export const metadata: Metadata = { title: "Editar sessão — Admin" };

export default async function EditarSessaoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sessao = await prisma.sessao.findUnique({ where: { id: Number(id) } });
  if (!sessao) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Editar sessão</h1>
      <div className="mt-6">
        <SessaoForm
          action={atualizarSessaoAction.bind(null, sessao.id)}
          valoresIniciais={{ nome: sessao.nome, tipo: sessao.tipo, pontosBase: sessao.pontosBase }}
          qrCode={sessao.qrCode}
        />
      </div>
    </div>
  );
}
