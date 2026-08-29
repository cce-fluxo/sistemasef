// scripts/test-sheets.ts
import { google } from "googleapis";

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SA_EMAIL,
      private_key: process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1qtZJHa53a7FcHem_UqNOf__xHV6XDY0mGm6NF03KBck",
    range: "A1:I5", // só as 5 primeiras linhas, pra teste rápido
  });

  console.log(res.data.values);
}

main().catch(console.error);