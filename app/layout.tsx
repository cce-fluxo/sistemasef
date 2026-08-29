import type { Metadata } from "next";
import { Black_Han_Sans, Nunito, Oswald } from "next/font/google";
import "./globals.css";

// Tipografia do protótipo (Figma): Black Han Sans para números/logo em
// display, Oswald para títulos e botões em caixa alta, Nunito para o corpo.
const blackHanSans = Black_Han_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-black-han",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Evento Gamificado",
  description: "App de gamificação para evento presencial de 5 dias",
};

// Roda antes da hidratação para aplicar o tema salvo sem flash de conteúdo
// (FOUC). Tema padrão é escuro quando não há preferência salva.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("tema");
    var isLight = stored === "claro";
    document.documentElement.classList.toggle("dark", !isLight);
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${blackHanSans.variable} ${oswald.variable} ${nunito.variable} min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
