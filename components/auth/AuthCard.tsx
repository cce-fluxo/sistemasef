import { LogoBadge } from "@/components/LogoBadge";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="animate-slide-up flex flex-col items-center gap-4 text-center">
        <LogoBadge size={88} />
        <div>
          <p className="font-display text-[13px] tracking-[0.2em] uppercase text-gold-400">— Semana —</p>
          <p className="font-display text-[42px] leading-none uppercase text-foreground">
            Fluxo<span className="text-gold-400">021</span>
          </p>
          <p className="mt-2 text-sm text-muted">Nosso jeito de fazer o amanhã</p>
        </div>
      </div>

      <div className="animate-slide-up rounded-2xl border border-line bg-surface p-6">
        <h1 className="font-heading text-xl font-bold uppercase text-foreground">{title}</h1>
        <p className="mt-0.5 mb-5 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </>
  );
}
