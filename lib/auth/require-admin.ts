import { redirect } from "next/navigation";
import { getSession } from "./get-session";
import type { SessionClaims } from "./session";

/**
 * Segunda camada de defesa além do proxy.ts: Server Actions são invocadas
 * via POST e, em tese, podem ser chamadas diretamente — não dependem só do
 * middleware de página. Toda action de admin chama isso primeiro.
 */
export async function requireAdmin(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}
