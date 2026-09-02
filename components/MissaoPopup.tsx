"use client";

import { useEffect, useState } from "react";

// Aparece uma vez por sessão do navegador (logo após o login, quando a Home
// monta pela primeira vez). O flag no sessionStorage evita reexibir a cada
// navegação até o usuário abrir o app de novo.
const STORAGE_KEY = "missao-triplo-vista";

export function MissaoPopup() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage indisponível (modo privado antigo etc.) — mostra mesmo assim
    }
    setAberto(true);
  }, []);

  function fechar() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignora: no pior caso o popup reaparece na próxima navegação
    }
    setAberto(false);
  }

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={fechar}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="missao-popup-titulo"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-3xl">
          🏆
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-500">
          Missão do dia
        </p>
        <h2 id="missao-popup-titulo" className="mt-1 font-display text-xl font-bold text-foreground">
          Triplo de Conhecimento
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          Participe de 3 palestras hoje e ganhe <span className="font-semibold text-gold-500">+30 pontos</span>!
        </p>

        <button
          type="button"
          onClick={fechar}
          className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-display font-semibold text-white transition hover:bg-brand-600"
        >
          Bora lá!
        </button>
      </div>
    </div>
  );
}
