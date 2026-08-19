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

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(getInitialIsLight);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("dark", !next);
    localStorage.setItem("tema", next ? "claro" : "escuro");
  }

  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-foreground/80 dark:border-white/10">
      <span className="flex items-center gap-2">
        <span aria-hidden suppressHydrationWarning>
          {isLight ? "☀️" : "🌙"}
        </span>
        Modo claro
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggle}
        suppressHydrationWarning
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          isLight ? "bg-brand-500" : "bg-navy-600"
        }`}
      >
        <span
          suppressHydrationWarning
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isLight ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
