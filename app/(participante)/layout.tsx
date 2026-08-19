import { BottomNav } from "@/components/BottomNav";

export default function ParticipanteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
