import { LogoBadge } from "@/components/LogoBadge";

const FEATURES = ["📱 Check-in por QR Code", "🎯 Missões e desafios", "🏆 Ranking"];

// Painel de marca exibido só no desktop (breakpoint lg, 1024px) — no mobile a
// tela de login mostra apenas o formulário centralizado.
export function AuthBrandPanel() {
  return (
    <aside className="header-gradient-brand relative hidden w-[45%] max-w-xl shrink-0 flex-col items-center justify-center overflow-hidden px-12 py-16 text-white lg:flex">
      <div className="relative flex flex-col items-center text-center">
        <LogoBadge size={120} />

        <p className="mt-6 font-display text-sm tracking-[0.25em] uppercase text-white/80">— Semana —</p>
        <p className="font-display text-[64px] leading-[0.9] uppercase">
          Fluxo<span className="text-gold-400">021</span>
        </p>
        <p className="mt-4 max-w-xs text-base leading-relaxed font-semibold text-white/80">
          Nosso jeito de fazer o amanhã
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          {FEATURES.map((f) => (
            <p key={f} className="rounded-[10px] bg-black/20 px-5 py-2.5 text-sm font-bold">
              {f}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
