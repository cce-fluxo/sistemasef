import { SignJWT, jwtVerify } from "jose";

// Auth própria via JWT em cookie httpOnly — não usa Supabase Auth (reservado
// a Storage/Realtime). Este módulo roda tanto em Server Actions/Components
// (Node) quanto no middleware (Edge), por isso só depende de `jose` (Web
// Crypto), nunca de bcrypt/Node APIs.
export const SESSION_COOKIE = "session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 2; // 2h
const REFRESH_THRESHOLD_SECONDS = 60 * 60; // renova depois de 1h de vida

export type Role = "PARTICIPANTE" | "ADMIN";

export type SessionClaims = {
  id: number;
  role: Role;
};

type VerifiedSession = SessionClaims & { issuedAt: number };

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado.");
  return new TextEncoder().encode(secret);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ id: claims.id, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<VerifiedSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.id !== "number" || (payload.role !== "PARTICIPANTE" && payload.role !== "ADMIN")) {
      return null;
    }
    return { id: payload.id, role: payload.role, issuedAt: payload.iat ?? 0 };
  } catch {
    return null;
  }
}

export function shouldRefresh(issuedAtSeconds: number): boolean {
  const ageSeconds = Date.now() / 1000 - issuedAtSeconds;
  return ageSeconds > REFRESH_THRESHOLD_SECONDS;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_DURATION_SECONDS,
  path: "/",
};
