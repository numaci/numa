import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }
  try {
    const updated = await prisma.passwordResetRequest.update({
      where: { id },
      data: { status: "sent" },
    });
    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
} 