import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Supprimer une section d'une catégorie
export async function DELETE(req: NextRequest, { params }: { params: { id: string, sectionId: string } }) {
  const sectionId = params.sectionId;
  await prisma.homeSection.delete({ where: { id: sectionId } });
  return NextResponse.json({ success: true });
} 