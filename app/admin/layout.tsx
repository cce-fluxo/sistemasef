import Link from "next/link";
import { logoutAction } from "@/actions/auth";

const LINKS = [
  { href: "/admin/sessoes", label: "Sessões" },
  { href: "/admin/missoes", label: "Missões" },
  { href: "/admin/presencas", label: "Presenças" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-black/5 bg-surface px-6 py-4 dark:border-white/5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-bold text-foreground">Admin</span>
            <nav className="flex gap-4">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/60 hover:text-brand-500"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-medium text-foreground/60 hover:text-brand-500">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
