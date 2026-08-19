import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sessao = await prisma.sessao.findUnique({
      where: { id: Number(id) },
      select: { nome: true, qrCode: true },
    });
    if (!sessao) {
      return NextResponse.json({ erro: "Sessão não encontrada." }, { status: 404 });
    }

    const png = await QRCode.toBuffer(sessao.qrCode, { type: "png", width: 512, margin: 2 });
    const nomeArquivo =
      sessao.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || sessao.qrCode;

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qrcode-${nomeArquivo}.png"`,
      },
    });
  } catch (error) {
    console.error("Geração de QR Code falhou:", error);
    return NextResponse.json({ erro: "Não foi possível gerar o QR Code." }, { status: 500 });
  }
}
