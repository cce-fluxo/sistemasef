// Script pontual para garantir um administrador sem apagar dados existentes
// (diferente de prisma/seed.ts, que faz deleteMany em tudo). Uso:
//   npx tsx prisma/create-admin.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
// Import relativo porque este arquivo roda via `tsx`, que não resolve os
// path aliases do tsconfig usados pelo compilador do Next.
import { prisma } from "../lib/prisma";

const EMAIL = "admin@evento.com";
const SENHA = "admin123";
const NOME = "Admin do Evento";

async function main() {
  const hashSenha = await bcrypt.hash(SENHA, 10);

  const admin = await prisma.participante.upsert({
    where: { email: EMAIL },
    update: { hashSenha, role: "ADMIN" },
    create: { nome: NOME, email: EMAIL, hashSenha, role: "ADMIN" },
  });

  console.log(`Administrador pronto: ${admin.email} (senha: ${SENHA})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
