import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionClaims } from "./session";

// Lê e valida a sessão a partir do cookie httpOnly. Uso em Server
// Components/Actions — o middleware já garante que rotas protegidas só são
// alcançadas com sessão válida, então um retorno null aqui normalmente só
// acontece em código chamado fora do fluxo protegido.
export async function getSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySession(token);
  if (!claims) return null;

  return { id: claims.id, role: claims.role };
}
