import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthTicker } from "@/components/auth/AuthTicker";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background-alt to-background">
      {/* Faixa de marca no topo, nas quatro cores do evento. */}
      <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-gold-400),var(--color-success-500),var(--color-info-500))]" />

      <div className="flex flex-1">
        <AuthBrandPanel />

        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-[420px] flex-col gap-6">
            {children}
            <ThemeToggle />
          </div>
        </main>
      </div>

      <AuthTicker />
    </div>
  );
}
