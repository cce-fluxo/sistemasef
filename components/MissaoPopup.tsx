"use client";

import { useEffect, useState } from "react";

// Aparece uma vez por carregamento de página: a variável de módulo é reiniciada
// em todo load de documento (abrir o app, refresh, redirect do login), mas
// persiste entre navegações SPA — então voltar para a Home vindo de outra aba
// não reexibe o popup durante a mesma visita.
let popupMostradoNestaCarga = false;

export function MissaoPopup() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (popupMostradoNestaCarga) return;
    popupMostradoNestaCarga = true;
    setAberto(true);
  }, []);

  function fechar() {
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
        <p className="mt-4 text-xl font-semibold uppercase tracking-wide text-red-600">
          ATENÇÃO
        </p>
        <h2 id="missao-popup-titulo" className="mt-1 font-display text-xl font-bold text-foreground">
          Encerramento do GAMEFICATION às 16:30!!!!
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          Participe do Encerramento às 16:30 do dia 04/09 e ganhe <span className="font-semibold text-gold-500">seus brindes</span>!
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
