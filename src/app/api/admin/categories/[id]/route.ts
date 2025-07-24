import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/categories/[id] - Récupérer une catégorie spécifique
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Inclure isPublic dans la réponse
    return NextResponse.json({ category: {
      ...category,
      productCount: category._count.products,
    }});
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la catégorie" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Modifier une catégorie
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { name, slug, description, imageUrl, isActive, isPublic } = body;

    // Validation des données
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et le slug sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si le slug existe déjà (sauf pour cette catégorie)
    const slugExists = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Une catégorie avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        isPublic: isPublic !== undefined ? isPublic : false,
      },
    });

    return NextResponse.json({ 
      category: updatedCategory,
      message: "Catégorie modifiée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la catégorie" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Vérifier si la catégorie existe et compter ses produits
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des produits dans cette catégorie
    if (category._count.products > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer cette catégorie car elle contient ${category._count.products} produit(s). Veuillez d'abord déplacer ou supprimer ces produits.` 
        },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Catégorie supprimée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
} 