import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Champs requis." }, { status: 400 });
    }
    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur introuvable." }, { status: 404 });
    }
    const valid = await bcrypt.compare(oldPassword, supplier.password);
    if (!valid) {
      return NextResponse.json({ error: "Ancien mot de passe incorrect." }, { status: 401 });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.supplier.update({ where: { id: params.id }, data: { password: hashed } });
    return NextResponse.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
} 