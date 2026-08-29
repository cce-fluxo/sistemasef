"use client";

import { useState } from "react";

// Lê a classe já aplicada pelo script inline em app/layout.tsx (que roda
// antes da hidratação para evitar flash). No servidor `document` não existe,
// então o SSR assume o tema escuro padrão — daí o suppressHydrationWarning
// nos elementos cujo estilo depende do valor real (lido só no cliente).
function getInitialIsLight(): boolean {
  if (typeof document === "undefined") return false;
  return !document.documentElement.classList.contains("dark");
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden>
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zm0 19h2v3h-2zM3.5 4.9l1.4-1.4 2.1 2.1-1.4 1.4zM17 18.4l1.4-1.4 2.1 2.1-1.4 1.4zM20 11h3v2h-3zM1 11h3v2H1zm18.5-6.1 1.4 1.4-2.1 2.1-1.4-1.4zM5 18.4l1.4 1.4-2.1 2.1L2.9 20.5z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden>
      <path d="M12.3 4.9c.4-.4.2-1.1-.4-1.1a8.5 8.5 0 1 0 8.3 10.4c.1-.6-.6-.9-1.1-.6a6.5 6.5 0 0 1-6.8-8.7z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(getInitialIsLight);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("dark", !next);
    localStorage.setItem("tema", next ? "claro" : "escuro");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Alternar tema"
      onClick={toggle}
      suppressHydrationWarning
      className="flex w-full items-center gap-2.5 px-4 py-2"
    >
      <span className="text-faint" suppressHydrationWarning>
        {isLight ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="flex-1 text-left text-sm font-bold text-muted" suppressHydrationWarning>
        {isLight ? "Modo claro" : "Modo escuro"}
      </span>
      <span
        suppressHydrationWarning
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          isLight ? "bg-brand-500" : "bg-line-strong"
        }`}
      >
        <span
          suppressHydrationWarning
          className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform ${
            isLight ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
