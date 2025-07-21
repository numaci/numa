import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Retirer un produit d'une section
export async function DELETE(req: NextRequest, { params }: { params: { id: string, sectionId: string, productId: string } }) {
  const { sectionId, productId } = params;
  await prisma.sectionProduct.deleteMany({ where: { sectionId, productId } });
  return NextResponse.json({ success: true });
} 