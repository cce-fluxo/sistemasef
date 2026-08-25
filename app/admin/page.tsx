import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { NovoAdminForm } from "@/components/admin/NovoAdminForm";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHomePage() {
  await requireAdmin();
  const administradores = await prisma.participante.findMany({
    where: { role: "ADMIN" },
    orderBy: { id: "asc" },
    select: { id: true, nome: true, email: true },
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Administradores</h1>
        <div className="mt-6 flex flex-col gap-2">
          {administradores.map((admin) => (
            <div
              key={admin.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-surface p-4 dark:border-white/5"
            >
              <div>
                <p className="font-medium text-foreground">{admin.nome}</p>
                <p className="text-sm text-foreground/60">{admin.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Novo administrador</h2>
        <div className="mt-6">
          <NovoAdminForm />
        </div>
      </div>
    </div>
  );
}
