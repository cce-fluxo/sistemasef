import { isEmailInscrito } from "@/lib/redis-inscritos";

async function checar(email: string) {
  console.log(`${(await isEmailInscrito(email)) ? "  TRUE " : " FALSE "} ${email}`);
}

async function main() {
  // Coluna F (institucional) — visto em scripts/test-sheets.ts
  await checar("luczende.20241@poli.ufrj.br");
  // Coluna I (pessoal), com maiúscula na planilha ("Laczende@gmail.com") —
  // testa a normalização lowercase
  await checar("LACZENDE@gmail.com");
  // Mesmo e-mail nas duas colunas
  await checar("gored112233@gmail.com");
  // Claramente falso
  await checar("naoexiste-fake-9999@exemplo.com");
  // Vazio / lixo
  await checar("   ");
}

main().catch(console.error);
