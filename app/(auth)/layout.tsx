import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-3xl shadow-lg shadow-brand-500/30">
              🏆
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Evento Gamificado
              </h1>
              <p className="text-sm text-foreground/60">Check-in, missões e ranking do evento</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-surface p-6 shadow-xl shadow-black/5 dark:border-white/5">
            {children}
          </div>

          <ThemeToggle />
        </div>
      </main>
    </div>
  );
}
