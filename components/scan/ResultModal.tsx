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
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {resultado.ok ? <ConteudoSucesso data={resultado.data} /> : <ConteudoErro erro={resultado.erro} />}

        <button
          type="button"
          onClick={onFechar}
          className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-display font-semibold text-white transition hover:bg-brand-600"
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
        <h2 className="mt-4 font-display text-xl font-bold text-foreground">Presença já registrada</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Você já tinha feito check-in em <strong>{data.nomeSessao}</strong>.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-500/20 text-3xl">
        ✅
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">Check-in em {data.nomeSessao}!</h2>
      <p className="mt-1 font-display text-3xl font-bold text-brand-500">+{data.pontosGanhos} pontos</p>

      {data.missoesDesbloqueadas.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {data.missoesDesbloqueadas.map((missao, i) => (
            <div
              key={missao.titulo}
              style={{ animationDelay: `${0.1 + i * 0.1}s`, animationFillMode: "backwards" }}
              className="animate-pop-in rounded-xl bg-gold-400/15 px-4 py-2.5 text-left"
            >
              <p className="text-sm font-semibold text-gold-500">🏆 Missão desbloqueada</p>
              <p className="text-sm text-foreground/80">
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
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">Não foi possível registrar</h2>
      <p className="mt-1 text-sm text-foreground/60">{erro}</p>
    </>
  );
}
