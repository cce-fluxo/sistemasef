import { TOKEN_VALIDADE_MINUTOS } from "@/lib/auth/recuperacao";
import type { Email } from "./enviar";

/**
 * HTML de e-mail é conservador de propósito: tabela, estilos inline e
 * nenhuma dependência externa. Clientes de e-mail (Gmail, Outlook) ignoram
 * <style>, flexbox e boa parte do CSS moderno.
 */
export function emailRecuperacaoSenha(nome: string, url: string): Omit<Email, "para"> {
  const primeiroNome = nome.split(" ")[0] ?? nome;

  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    "Recebemos um pedido para redefinir a senha da sua conta na Semana Fluxo.",
    "Abra o link abaixo para criar uma nova senha:",
    "",
    url,
    "",
    `O link vale por ${TOKEN_VALIDADE_MINUTOS} minutos e só pode ser usado uma vez.`,
    "Se não foi você que pediu, ignore este e-mail — sua senha continua a mesma.",
  ].join("\n");

  const html = `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 0;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#e8521a;padding:24px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase">
            Semana Fluxo 021
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px;color:#1a1a2e;font-size:15px;line-height:1.6">
            <p style="margin:0 0 16px">Olá, ${escaparHtml(primeiroNome)}!</p>
            <p style="margin:0 0 16px">
              Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
            </p>
            <p style="margin:0 0 24px">
              <a href="${escaparHtml(url)}" style="display:inline-block;background:#e8521a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em">
                Criar nova senha
              </a>
            </p>
            <p style="margin:0 0 16px;color:#6b6b7b;font-size:13px">
              O link vale por ${TOKEN_VALIDADE_MINUTOS} minutos e só pode ser usado uma vez.
            </p>
            <p style="margin:0;color:#6b6b7b;font-size:13px">
              Se não foi você que pediu, ignore este e-mail — sua senha continua a mesma.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  return { assunto: "Redefinir sua senha — Semana Fluxo", html, texto };
}

// O nome vem do cadastro do participante, então é conteúdo controlado pelo
// usuário caindo dentro de HTML — escapar é obrigatório.
function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
