import logo from "../../images/WhatsApp_Image_2026-08-07_at_18.02.49.jpeg"

const FEATURES = [
  { icon: "📱", label: "Check-in por QR Code" },
  { icon: "🎯", label: "Missões e desafios" },
  { icon: "🏆", label: "Ranking" },
];

// Painel de marca exibido só no desktop (breakpoint lg, 1024px) — no mobile a
// tela de login mostra apenas o formulário centralizado.
export function AuthBrandPanel() {
  return (
    <aside className="header-gradient-brand relative hidden w-[45%] max-w-xl shrink-0 flex-col items-center justify-center overflow-hidden px-12 py-16 text-white lg:flex">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full ">
          <img src={logo.src} alt="Semana Fluxo" className="h-full w-full rounded-full" />
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.3em] text-white/70 uppercase">— Semana Fluxo —</p>
        <h2 className="mt-2 font-display text-5xl leading-none font-extrabold uppercase">
          Semana <span className="text-gold-400">Fluxo</span>
        </h2>
        <p className="mt-4 max-w-xs text-sm font-medium text-white/80">
          Check-in, missões e ranking do evento
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="rounded-xl bg-black/20 px-5 py-3 text-sm font-semibold">
              {f.icon} {f.label}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-black/25 px-6 py-4">
          <p className="text-sm font-semibold text-gold-400">🎉 5 dias de evento</p>
          <p className="mt-1 text-xs text-white/70">App de gamificação</p>
        </div>
      </div>
    </aside>
  );
}
