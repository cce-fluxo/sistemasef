import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signSession, shouldRefresh, verifySession } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login", "/cadastro", "/recuperar-senha"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (isPublicPath(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminPath(pathname) && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();

  // Refresh silencioso: reemite o cookie com nova expiração se a sessão já
  // passou de metade da vida útil, sem exigir novo login.
  if (shouldRefresh(session.issuedAt)) {
    const freshToken = await signSession({ id: session.id, role: session.role });
    response.cookies.set(SESSION_COOKIE, freshToken, sessionCookieOptions);
  }

  return response;
}

export const config = {
  // api/_loadtest fica de fora do gate de sessão: o endpoint de load testing
  // (protegido pela sua própria env var ENABLE_LOADTEST_ENDPOINT, ver
  // app/api/_loadtest/scan/route.ts) é chamado pelo k6 sem cookie de sessão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron|api/_loadtest).*)"],
};
