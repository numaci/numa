import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Détail d'un fournisseur
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing supplier id" }), { status: 400 });
  }
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: true,
      // payments: true, // supprimé car n'existe pas
    },
  });
  if (!supplier) {
    return new Response(JSON.stringify({ error: "Supplier not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(supplier), { status: 200 });
}

// PUT: Modifier un fournisseur
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();
  const { name, email, phone, address } = data;
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name, email, phone, address },
  });
  return NextResponse.json(supplier);
}

// DELETE: Supprimer un fournisseur
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 