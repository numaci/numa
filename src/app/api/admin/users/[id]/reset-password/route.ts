import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }
  try {
    const { password } = await request.json();
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Mot de passe invalide" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
} 