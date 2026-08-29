import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Janela curta de propósito: o link some rápido se o e-mail for parar na
// caixa errada, e durante um evento de poucos dias ninguém precisa de mais.
export const TOKEN_VALIDADE_MINUTOS = 60;

/**
 * Token de recuperação: 32 bytes aleatórios (256 bits) em base64url. Só o
 * SHA-256 vai para o banco — ver comentário do modelo em prisma/schema.prisma.
 */
export function gerarToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Comparação de hashes em tempo constante. A busca no banco é por índice
 * único (que já vaza timing por natureza), mas manter a comparação final
 * constante evita transformar qualquer revalidação futura em oráculo.
 */
export function hashesConferem(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function expiraEm(agora = new Date()): Date {
  return new Date(agora.getTime() + TOKEN_VALIDADE_MINUTOS * 60 * 1000);
}

/**
 * Monta a URL absoluta do link de redefinição. Precisa ser absoluta porque
 * vai dentro de um e-mail; `NEXT_PUBLIC_APP_URL` deve apontar para o domínio
 * público (na Vercel, VERCEL_PROJECT_PRODUCTION_URL serve de fallback).
 */
export function urlRedefinicao(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/redefinir-senha?token=${encodeURIComponent(token)}`;
}
