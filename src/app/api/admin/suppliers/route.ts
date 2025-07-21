import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET: Liste des fournisseurs
export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(suppliers);
}

// POST: Créer un fournisseur
export async function POST(req: Request) {
  const data = await req.json();
  const { name, email, password, phone, address } = data;
  // Vérification doublon email
  if (!prisma || !prisma.supplier) {
    return NextResponse.json({ error: "Erreur interne: accès base de données." }, { status: 500 });
  }
  const existing = await prisma.supplier.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un fournisseur avec cet email existe déjà." }, { status: 409 });
  }
  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  const supplier = await prisma.supplier.create({
    data: { name, email, password: hashedPassword, phone, address },
  });
  return NextResponse.json(supplier, { status: 201 });
}

// DELETE: Supprimer un fournisseur
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID du fournisseur requis" }, { status: 400 });
  }
  try {
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ message: "Fournisseur supprimé" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression du fournisseur" }, { status: 500 });
  }
} 