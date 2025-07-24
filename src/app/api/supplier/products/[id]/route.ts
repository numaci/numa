import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const {
      name,
      imageUrl,
      shortDesc,
      longDesc,
      price,
      categoryId,
      quantity,
      variants
    } = await req.json();
    if (!name || !price || !categoryId || !shortDesc) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        imageUrl,
        description: longDesc || shortDesc,
        price: parseFloat(price),
        categoryId,
        stock: quantity ? parseInt(quantity) : 0,
        attributes: variants && variants.length > 0 ? { variants } : undefined,
        status: "PENDING",
        shortDescription: shortDesc,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
} 