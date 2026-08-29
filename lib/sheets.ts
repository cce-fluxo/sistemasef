import { google } from "googleapis";

// Planilha oficial de inscritos da Semana Fluxo (mantida pela organização,
// sincronizada via Vetto).
const PLANILHA_INSCRITOS_ID = "1qtZJHa53a7FcHem_UqNOf__xHV6XDY0mGm6NF03KBck";

// Dentro do range "A:I" há duas colunas de e-mail: F ("Student → Email",
// institucional, índice 5) e I ("Student → Contact Email", pessoal, índice 8).
// Um inscrito pode ter usado qualquer uma das duas no formulário, então a
// checagem considera ambas.
const COLUNAS_EMAIL = [5, 8] as const;

/** Normalização única (lowercase + trim) usada tanto ao popular o cache
 * quanto ao consultar um e-mail vindo do formulário de cadastro. */
export function normalizarEmail(valor: string): string {
  return valor.trim().toLowerCase();
}

/**
 * Lê a planilha de inscritos via Google Sheets API v4 (Service Account, só
 * leitura) e devolve o conjunto de e-mails normalizados das colunas F e I.
 *
 * Leitura pesada (~6.000 linhas) — chamada exclusivamente pelo cron
 * `/api/cron/refresh-inscritos`. A Server Action de cadastro nunca toca a
 * Sheets API; ela só consulta o cache no Redis (ver lib/redis-inscritos.ts).
 */
export async function fetchInscritosEmails(): Promise<Set<string>> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SA_EMAIL,
      // A private key vem do .env com "\n" literal; o GoogleAuth espera
      // quebras de linha reais.
      private_key: process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: PLANILHA_INSCRITOS_ID,
    range: "A:I",
  });

  const linhas = res.data.values ?? [];
  const emails = new Set<string>();

  for (const linha of linhas) {
    for (const coluna of COLUNAS_EMAIL) {
      const bruto = linha[coluna];
      if (typeof bruto !== "string") continue;
      const email = normalizarEmail(bruto);
      // Descarta células vazias e o cabeçalho ("Student → Email" etc.).
      if (email.includes("@")) emails.add(email);
    }
  }

  return emails;
}
