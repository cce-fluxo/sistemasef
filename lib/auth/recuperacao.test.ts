import { afterEach, describe, expect, it } from "vitest";
import {
  TOKEN_VALIDADE_MINUTOS,
  expiraEm,
  gerarToken,
  hashToken,
  hashesConferem,
  urlRedefinicao,
} from "./recuperacao";

describe("gerarToken", () => {
  it("gera token em base64url, seguro para colar numa URL", () => {
    const { token } = gerarToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    // 32 bytes em base64url, sem padding.
    expect(token).toHaveLength(43);
  });

  it("nunca repete o mesmo token", () => {
    const tokens = new Set(Array.from({ length: 500 }, () => gerarToken().token));
    expect(tokens.size).toBe(500);
  });

  it("devolve o hash correspondente ao token", () => {
    const { token, hash } = gerarToken();
    expect(hash).toBe(hashToken(token));
    expect(hash).toHaveLength(64);
  });

  it("não permite recuperar o token a partir do hash", () => {
    const { token, hash } = gerarToken();
    expect(hash).not.toContain(token);
  });
});

describe("hashesConferem", () => {
  it("aceita hashes iguais", () => {
    const { hash } = gerarToken();
    expect(hashesConferem(hash, hash)).toBe(true);
  });

  it("rejeita hashes de tokens diferentes", () => {
    expect(hashesConferem(gerarToken().hash, gerarToken().hash)).toBe(false);
  });

  it("rejeita hash de tamanho diferente sem lançar", () => {
    const { hash } = gerarToken();
    expect(hashesConferem(hash, "abcd")).toBe(false);
  });
});

describe("expiraEm", () => {
  it("expira exatamente após a janela configurada", () => {
    const agora = new Date("2026-09-01T12:00:00.000Z");
    expect(expiraEm(agora).toISOString()).toBe("2026-09-01T13:00:00.000Z");
    expect(TOKEN_VALIDADE_MINUTOS).toBe(60);
  });

  it("um token recém-criado ainda não expirou", () => {
    expect(expiraEm().getTime()).toBeGreaterThan(Date.now());
  });
});

describe("urlRedefinicao", () => {
  const original = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = original;
  });

  it("monta a URL absoluta com o token na query", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://semanafluxo.com.br";
    expect(urlRedefinicao("abc123")).toBe("https://semanafluxo.com.br/redefinir-senha?token=abc123");
  });

  it("não duplica a barra quando a base termina com /", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://semanafluxo.com.br/";
    expect(urlRedefinicao("abc123")).toBe("https://semanafluxo.com.br/redefinir-senha?token=abc123");
  });

  it("escapa caracteres do token na query", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://semanafluxo.com.br";
    // base64url não gera "+" nem "/", mas a URL não pode depender disso.
    expect(urlRedefinicao("a+b/c=")).toBe("https://semanafluxo.com.br/redefinir-senha?token=a%2Bb%2Fc%3D");
  });
});
