import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Retirer un produit d'une section
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string, sectionId: string, productId: string }> }) {
  const { sectionId, productId } = await context.params;
  await prisma.sectionProduct.deleteMany({ where: { sectionId, productId } });
  return NextResponse.json({ success: true });
} 