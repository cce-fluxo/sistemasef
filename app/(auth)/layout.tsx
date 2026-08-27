import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthTicker } from "@/components/auth/AuthTicker";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />

      <div className="flex flex-1">
        <AuthBrandPanel />

        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {children}
            <ThemeToggle />
          </div>
        </main>
      </div>

      <AuthTicker />
    </div>
  );
}
