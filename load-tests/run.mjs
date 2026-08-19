// Carrega load-tests/.env.loadtest (se existir) e roda o k6 contra o script
// de load test, checando antes se o k6 está instalado. Usado pelo script
// npm "loadtest:qr-scan" -- ver load-tests/README.md para o setup completo.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const loadTestsDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(loadTestsDir, ".env.loadtest");
const scriptPath = path.join(loadTestsDir, "stress-test-qr-scan.js");

if (!existsSync(envPath)) {
  console.error(
    `Arquivo não encontrado: ${envPath}\n` +
      "Copie load-tests/.env.loadtest.example para load-tests/.env.loadtest e preencha com valores de staging antes de rodar.",
  );
  process.exit(1);
}

dotenv.config({ path: envPath });

const k6Check = spawnSync("k6", ["version"], { stdio: "ignore" });
if (k6Check.error) {
  console.error(
    "k6 não encontrado no PATH. Instale antes de continuar: https://grafana.com/docs/k6/latest/set-up/install-k6/",
  );
  process.exit(1);
}

const result = spawnSync("k6", ["run", scriptPath], { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
