"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Ícones sólidos (fill), como no protótipo do Figma — não os de contorno.
const ICONS = {
  home: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
  sobre: (
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  ),
  missoes: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
  agenda: (
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V9h14v12z" />
  ),
};

function NavIcon({ name, size = 22 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden>
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
    <nav className="fixed inset-x-0 bottom-0 z-[100] flex items-start justify-around border-t-2 border-line bg-background-alt px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {LEFT_LINKS.map((link) => (
        <NavLink key={link.href} {...link} active={pathname === link.href} />
      ))}

      <Link
        href="/scan"
        aria-label="Escanear QR Code"
        className="-mt-6 flex flex-col items-center gap-0.5"
      >
        <span className="animate-pulse-glow flex h-15 w-15 items-center justify-center rounded-full border-[3px] border-background-alt bg-gradient-to-br from-brand-500 to-brand-400 text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" width={28} height={28} aria-hidden>
            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 19h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
          </svg>
        </span>
        <span className="text-[10px] font-bold text-brand-500">QR CODE</span>
      </Link>

      {RIGHT_LINKS.map((link) => (
        <NavLink key={link.href} {...link} active={pathname === link.href} />
      ))}
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
    <Link href={href} className={`nav-item ${active ? "active" : "hover:text-muted"}`}>
      <NavIcon name={icon} />
      {label}
    </Link>
  );
}
