import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id] - Récupère un produit spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);

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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);

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

    // Vérification que le slug est unique (sauf pour ce produit)
    const slugConflict = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: "Un produit avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Vérification que le SKU est unique (si fourni, sauf pour ce produit)
    if (sku) {
      const skuConflict = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: id },
        },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: "Un produit avec ce SKU existe déjà" },
          { status: 400 }
        );
      }
    }

    // Vérification que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "La catégorie sélectionnée n'existe pas" },
        { status: 400 }
      );
    }

    // Mise à jour du produit
    console.log("Images reçues dans le body (PUT):", images);
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: price.toString(),
        comparePrice: comparePrice ? comparePrice.toString() : null,
        stock: parseInt(stock),
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        categoryId,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        isBest: Boolean(isBest),
        imageUrl: imageUrl || null,
        images: Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : '[]',
        shippingPrice: shippingPrice !== undefined && shippingPrice !== null && shippingPrice !== '' ? shippingPrice : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Gestion des variantes : suppression puis ajout (remplacement complet)
    if (variants && Array.isArray(variants)) {
      // Supprimer les anciennes variantes
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      // Ajouter les nouvelles variantes
      const variantsToCreate = variants
        .filter(v => v.name && v.value && v.price)
        .map(v => ({
          productId: id,
          name: v.name,
          value: v.value,
          price: v.price,
        }));
      if (variantsToCreate.length > 0) {
        await prisma.productVariant.createMany({ data: variantsToCreate });
      }
    }

    return NextResponse.json({
      message: "Produit modifié avec succès",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Erreur lors de la modification du produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Supprime un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);

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