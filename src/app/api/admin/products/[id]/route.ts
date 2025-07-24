import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id] - Récupère un produit spécifique
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Récupération du produit avec sa catégorie ET ses variantes
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Correction : sérialisation des Decimals
    const safeProduct = {
      ...product,
      price: product.price?.toString(),
      comparePrice: product.comparePrice?.toString() ?? null,
      variants: Array.isArray(product.variants)
        ? product.variants.map(v => ({ ...v, price: v.price?.toString() }))
        : [],
    };

    return NextResponse.json(safeProduct);

  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Modifie un produit existant
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Vérification que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Récupération des données du produit
    const body = await request.json();

    // Mise à jour partielle : si on ne veut changer que isActive ou isFeatured
    if (Object.keys(body).length === 1 && (body.hasOwnProperty('isActive') || body.hasOwnProperty('isFeatured'))) {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: body,
      });
      return NextResponse.json({
        message: "Produit mis à jour avec succès",
        product: updatedProduct,
      });
    }

    // Sinon, édition complète (ancienne logique)
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      sku,
      weight,
      dimensions,
      categoryId,
      isActive,
      isFeatured,
      imageUrl,
      images,
      variants,
      shippingPrice,
      isBest,
    } = body;

    // Validation des données requises
    if (!name || !slug || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        comparePrice,
        stock,
        sku,
        weight,
        dimensions,
        categoryId,
        isActive,
        isFeatured,
        imageUrl,
        images,
        variants,
        shippingPrice,
        isBest,
      },
    });

    return NextResponse.json({
      message: "Produit mis à jour avec succès",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Supprime un produit
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Vérification que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Vérification qu'aucune commande n'utilise ce produit
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    });

    if (orderItems.length > 0) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer ce produit car il est utilisé dans des commandes. Considérez le désactiver à la place." 
        },
        { status: 400 }
      );
    }

    // Suppression des éléments du panier associés
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });

    // Suppression des avis associés
    await prisma.review.deleteMany({
      where: { productId: id },
    });

    // Suppression du produit
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Produit supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 