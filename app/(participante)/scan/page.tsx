import type { Metadata } from "next";
import { ScanScreen } from "@/components/scan/ScanScreen";

export const metadata: Metadata = {
  title: "Escanear QR Code — Evento Gamificado",
};

export default function ScanPage() {
  return <ScanScreen />;
}
