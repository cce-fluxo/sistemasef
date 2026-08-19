"use client";

import { useState, useTransition, type FormEvent } from "react";
import { checkInAction, type CheckinActionState } from "@/actions/checkin";
import { QrScanner } from "./QrScanner";
import { ResultModal } from "./ResultModal";

export function ScanScreen() {
  const [modo, setModo] = useState<"camera" | "manual">("camera");
  const [codigoManual, setCodigoManual] = useState("");
  const [resultado, setResultado] = useState<CheckinActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const scannerAtivo = modo === "camera" && resultado === null && !pending;

  function processarCodigo(codigo: string) {
    startTransition(async () => {
      const resposta = await checkInAction(codigo);
      setResultado(resposta);
    });
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (!codigoManual.trim() || pending) return;
    processarCodigo(codigoManual.trim());
  }

  return (
    <div className="px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Escanear QR Code</h1>
      <p className="mt-1 text-sm text-foreground/60">Aponte a câmera para o QR Code do estande ou palestra.</p>

      <div className="mt-6">
        {modo === "camera" ? (
          <>
            <QrScanner ativo={scannerAtivo} onDecode={processarCodigo} />
            {pending && <p className="mt-4 text-center text-sm text-foreground/60">Registrando presença...</p>}
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="mx-auto flex max-w-xs flex-col gap-3">
            <input
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Cole ou digite o código"
              disabled={pending}
              className="rounded-xl border border-black/10 bg-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:opacity-60 dark:border-white/10"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-500 py-3 font-display font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {pending ? "Registrando..." : "Registrar presença"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setModo(modo === "camera" ? "manual" : "camera")}
          className="mx-auto mt-4 block text-sm font-medium text-brand-500 hover:underline"
        >
          {modo === "camera" ? "Digitar código manualmente" : "Usar a câmera"}
        </button>
      </div>

      {resultado && <ResultModal resultado={resultado} onFechar={() => setResultado(null)} />}
    </div>
  );
}
