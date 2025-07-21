import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Ajouter un produit à une section
export async function POST(req: NextRequest, { params }: { params: { id: string, sectionId: string } }) {
  const sectionId = params.sectionId;
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId requis" }, { status: 400 });
  }
  // Vérifier si déjà présent
  const exists = await prisma.sectionProduct.findFirst({ where: { sectionId, productId } });
  if (exists) {
    return NextResponse.json({ error: "Produit déjà dans la section" }, { status: 400 });
  }
  const sectionProduct = await prisma.sectionProduct.create({
    data: { sectionId, productId }
  });
  return NextResponse.json({ success: true, sectionProduct });
} 