"use client";

import type { CheckinActionState, CheckinResultado } from "@/actions/checkin";

type Props = {
  resultado: CheckinActionState;
  onFechar: () => void;
};

export function ResultModal({ resultado, onFechar }: Props) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onFechar}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-3xl border border-line bg-background-alt p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {resultado.ok ? <ConteudoSucesso data={resultado.data} /> : <ConteudoErro erro={resultado.erro} />}

        <button
          type="button"
          onClick={onFechar}
          className="btn-primary mt-6"
        >
          {resultado.ok && !resultado.data.jaRegistrado ? "Continuar escaneando" : "Fechar"}
        </button>
      </div>
    </div>
  );
}

function ConteudoSucesso({ data }: { data: CheckinResultado }) {
  if (data.jaRegistrado) {
    return (
      <>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-3xl">
          ℹ️
        </div>
        <h2 className="mt-4 font-heading text-lg font-semibold uppercase text-foreground">Presença já registrada</h2>
        <p className="mt-1 text-sm text-muted">
          Você já tinha feito check-in em <strong>{data.nomeSessao}</strong>.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex h-25 w-25 items-center justify-center rounded-full bg-gradient-to-br from-success-500 to-success-400 text-white">
        <svg viewBox="0 0 24 24" fill="currentColor" width={48} height={48} aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <p className="mt-6 font-display text-[32px] leading-none uppercase text-gold-400">
        +{data.pontosGanhos} pontos!
      </p>
      <h2 className="mt-2 font-heading text-lg font-semibold uppercase text-foreground">Presença registrada!</h2>
      <p className="mt-1 text-sm text-muted">{data.nomeSessao}</p>

      {data.missoesDesbloqueadas.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {data.missoesDesbloqueadas.map((missao, i) => (
            <div
              key={missao.titulo}
              style={{ animationDelay: `${0.1 + i * 0.1}s`, animationFillMode: "backwards" }}
              className="animate-pop-in rounded-xl bg-gold-400/15 px-4 py-2.5 text-left"
            >
              <p className="text-sm font-extrabold text-gold-400">🏆 Missão desbloqueada</p>
              <p className="text-sm text-muted">
                {missao.titulo} <span className="font-semibold">+{missao.pontosBonus} pts</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ConteudoErro({ erro }: { erro: string }) {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl">
        ⚠️
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold uppercase text-foreground">Não foi possível registrar</h2>
      <p className="mt-1 text-sm text-muted">{erro}</p>
    </>
  );
}
