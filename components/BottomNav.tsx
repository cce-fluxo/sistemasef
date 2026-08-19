"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  sobre: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </>
  ),
  missoes: <path d="m12 3 2.6 5.6L21 9.3l-4.5 4.2L17.6 20 12 16.8 6.4 20l1.1-6.5L3 9.3l6.4-.7z" />,
  agenda: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
    </>
  ),
};

function NavIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {ICONS[name]}
    </svg>
  );
}

const LEFT_LINKS = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/sobre", label: "Sobre", icon: "sobre" as const },
];

const RIGHT_LINKS = [
  { href: "/missoes", label: "Missões", icon: "missoes" as const },
  { href: "/agenda", label: "Agenda", icon: "agenda" as const },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-navy-950/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {LEFT_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={pathname === link.href} />
        ))}

        <Link
          href="/scan"
          aria-label="Escanear QR Code"
          className="relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-navy-950 bg-brand-500 text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
          </svg>
        </Link>

        {RIGHT_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={pathname === link.href} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition ${
        active ? "text-brand-400" : "text-white/50 hover:text-white/80"
      }`}
    >
      <NavIcon name={icon} />
      {label}
    </Link>
  );
}
