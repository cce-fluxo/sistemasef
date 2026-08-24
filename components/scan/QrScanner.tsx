"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Status = "iniciando" | "lendo" | "permissao-negada" | "sem-camera" | "sem-suporte" | "erro";

type Props = {
  ativo: boolean;
  onDecode: (texto: string) => void;
};

export function QrScanner({ ativo, onDecode }: Props) {
  const elementId = `qr-scanner-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [status, setStatus] = useState<Status>("iniciando");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onDecodeRef = useRef(onDecode);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    if (!ativo) return;

    let cancelado = false;

    async function iniciar() {
      // Sem `getUserMedia` exposto (Safari iOS fora de HTTPS/localhost, ou
      // navegador muito antigo) — nem tenta, já cai no fallback manual.
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus("sem-suporte");
        return;
      }

      const scanner = new Html5Qrcode(elementId, { verbose: false });
      scannerRef.current = scanner;
      setStatus("iniciando");

      // `html5-qrcode` continua chamando o callback de sucesso a cada frame
      // (fps: 10) até o scanner ser efetivamente parado, o que só acontece
      // de forma assíncrona quando o componente reage à mudança de estado.
      // Sem essa trava, o mesmo QR é decodificado várias vezes nesse meio
      // tempo, disparando `onDecode`/o popup de resultado repetidamente.
      let lido = false;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decodedText) => {
            if (lido) return;
            lido = true;
            scanner.pause(true);
            onDecodeRef.current(decodedText);
          },
          () => {
            // Erro de decodificação por frame (nenhum QR visível naquele
            // instante) — esperado a cada frame sem QR na câmera, ignorado.
          },
        );
        if (!cancelado) setStatus("lendo");
      } catch (err) {
        if (cancelado) return;
        const msg = String(err);
        if (/NotAllowedError|Permission denied/i.test(msg)) {
          setStatus("permissao-negada");
        } else if (/NotFoundError|no camera/i.test(msg)) {
          setStatus("sem-camera");
        } else {
          setStatus("erro");
        }
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      const atual = scannerRef.current;
      scannerRef.current = null;
      if (atual?.isScanning) {
        atual
          .stop()
          .then(() => atual.clear())
          .catch(() => {});
      } else {
        atual?.clear();
      }
    };
  }, [ativo, elementId]);

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl bg-black">
        <div id={elementId} className="h-full w-full" />
        {ativo && status === "iniciando" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-xs font-medium">Abrindo câmera...</span>
          </div>
        )}
      </div>

      {ativo && status === "permissao-negada" && (
        <MensagemErro
          titulo="Permissão da câmera negada"
          texto="Habilite o acesso à câmera nas configurações do navegador e tente novamente."
        />
      )}
      {ativo && status === "sem-camera" && (
        <MensagemErro titulo="Nenhuma câmera encontrada" texto="Use a opção de digitar o código manualmente abaixo." />
      )}
      {ativo && status === "sem-suporte" && (
        <MensagemErro
          titulo="Câmera indisponível"
          texto="No iPhone, confirme que o endereço começa com https:// e que o Safari tem permissão de câmera ativada em Ajustes. Enquanto isso, use o código manual abaixo."
        />
      )}
      {ativo && status === "erro" && (
        <MensagemErro titulo="Não foi possível abrir a câmera" texto="Tente novamente ou use o código manual abaixo." />
      )}
    </div>
  );
}

function MensagemErro({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mx-auto mt-4 max-w-xs rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
      <p className="text-sm font-semibold text-red-500">{titulo}</p>
      <p className="mt-1 text-xs text-foreground/60">{texto}</p>
    </div>
  );
}
