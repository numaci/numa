import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Liste des sections d'une catégorie
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = id;
  const sections = await prisma.homeSection.findMany({
    where: { categoryId },
    orderBy: { order: "asc" },
    include: {
      products: {
        include: {
          product: true
        },
        orderBy: { order: "asc" }
      }
    }
  });
  // Formatage simple pour le front
  return NextResponse.json({
    sections: sections.map(section => ({
      id: section.id,
      title: section.title,
      products: section.products.map(sp => ({
        id: sp.product.id,
        name: sp.product.name,
        imageUrl: sp.product.imageUrl,
        price: Number(sp.product.price)
      }))
    }))
  });
}

// POST: Ajouter une section à une catégorie
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = id;
  const { title } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }
  const section = await prisma.homeSection.create({
    data: {
      title,
      categoryId
    }
  });
  return NextResponse.json({ section: { id: section.id, title: section.title, products: [] } });
} 