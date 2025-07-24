import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const config = await prisma.whatsappConfig.findUnique({ where: { id } });
  if (!config) {
    return NextResponse.json({ error: "Numéro introuvable" }, { status: 404 });
  }
  const updated = await prisma.whatsappConfig.update({
    where: { id },
    data: { isActive: !config.isActive },
  });
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/admin/whatsapp`);
}