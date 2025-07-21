import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();

  // On retire productId/categoryId si vides ou null
  if (!data.productId) delete data.productId;
  if (!data.categoryId) delete data.categoryId;

  // Vérifie que le productId existe si présent
  if (data.productId) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });
    if (!product) {
      return NextResponse.json(
        { error: "Le produit sélectionné n'existe pas." },
        { status: 400 }
      );
    }
  }

  // Vérifie que le categoryId existe si présent
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      return NextResponse.json(
        { error: "La catégorie sélectionnée n'existe pas." },
        { status: 400 }
      );
    }
  }

  const ad = await prisma.ad.create({ data });
  return NextResponse.json(ad);
} 