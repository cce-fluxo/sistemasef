import logo from "@/images/WhatsApp_Image_2026-08-07_at_18.02.49.jpeg";

export function LogoBadge({ size = 56 }: { size?: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full border-2 border-white/30"
      style={{ width: size, height: size }}
    >
      <img src={logo.src} alt="Semana Fluxo" className="h-full w-full object-cover" />
    </div>
  );
}
