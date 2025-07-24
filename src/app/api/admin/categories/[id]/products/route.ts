import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Liste des produits actifs de la catégorie
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = id;
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      price: true
    },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ products: products.map(p => ({ ...p, price: Number(p.price) })) });
} 