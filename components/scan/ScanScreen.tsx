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
    <div className="px-5 py-10">
      <h1 className="text-center font-heading text-[22px] font-bold uppercase text-foreground">Escanear QR Code</h1>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted">
        Aponte a câmera para o QR Code do estande ou palestra
      </p>

      <div className="mt-6">
        {modo === "camera" ? (
          <>
            <QrScanner ativo={scannerAtivo} onDecode={processarCodigo} />
            {pending && <p className="mt-4 text-center text-sm text-muted">Registrando presença...</p>}
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="mx-auto flex max-w-xs flex-col gap-3">
            <input
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Cole ou digite o código"
              disabled={pending}
              className="input-field disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary"
            >
              {pending ? "Registrando..." : "Registrar presença"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setModo(modo === "camera" ? "manual" : "camera")}
          className="mx-auto mt-6 block text-sm font-extrabold text-brand-500 hover:underline"
        >
          {modo === "camera" ? "Digitar código manualmente" : "Usar a câmera"}
        </button>
      </div>

      {resultado && <ResultModal resultado={resultado} onFechar={() => setResultado(null)} />}
    </div>
  );
}
