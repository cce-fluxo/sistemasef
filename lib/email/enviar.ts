import nodemailer, { type Transporter } from "nodemailer";

/**
 * Único ponto de saída de e-mail do sistema. Todo o resto do código chama
 * `enviarEmail()` e não sabe qual é o provedor — trocar SMTP por uma API
 * (Resend, SES) é reescrever só este arquivo.
 *
 * Envio SMTP abre uma conexão TCP na porta configurada, o que exige runtime
 * Node. Server Actions rodam em Node por padrão; se algum dia esta função
 * for chamada de uma rota Edge, é aqui que vai quebrar.
 */

export type Email = {
  para: string;
  assunto: string;
  html: string;
  texto: string;
};

let transporter: Transporter | undefined;

function lerConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const senha = process.env.SMTP_PASSWORD;
  const remetente = process.env.SMTP_FROM;
  if (!host || !user || !senha || !remetente) return null;

  // 465 fala TLS desde o handshake; 587 sobe para TLS via STARTTLS.
  const porta = Number(process.env.SMTP_PORT ?? 587);
  return { host, porta, seguro: porta === 465, user, senha, remetente };
}

// Instanciação preguiçosa, como em lib/ratelimit.ts: sem isso, build e dev
// sem credenciais SMTP quebrariam na importação do módulo.
function getTransporter(config: NonNullable<ReturnType<typeof lerConfig>>): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.porta,
      secure: config.seguro,
      auth: { user: config.user, pass: config.senha },
    });
  }
  return transporter;
}

export async function enviarEmail({ para, assunto, html, texto }: Email): Promise<void> {
  const config = lerConfig();

  // Sem SMTP configurado em desenvolvimento, o e-mail vai para o terminal em
  // vez de derrubar o fluxo — assim dá para testar recuperação de senha
  // localmente sem credenciais. Em produção, falta de config é erro.
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP não configurado: defina SMTP_HOST, SMTP_USER, SMTP_PASSWORD e SMTP_FROM.");
    }
    console.info(`\n[email:dev] para=${para}\n[email:dev] assunto=${assunto}\n${texto}\n`);
    return;
  }

  await getTransporter(config).sendMail({
    from: config.remetente,
    to: para,
    subject: assunto,
    text: texto,
    html,
  });
}
