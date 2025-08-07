import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products - Récupère la liste des produits avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    // Ajout : mode autocomplétion pour le formulaire de pub
    if (searchParams.get("autocomplete") === "1") {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(products);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "all";

    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Construction des conditions de filtrage
    const where: any = {};

    // Filtre par recherche (nom ou slug)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtre par catégorie
    if (category) {
      where.categoryId = category;
    }

    // Filtre par statut
    switch (status) {
      case "active":
        where.isActive = true;
        break;
      case "inactive":
        where.isActive = false;
        break;
      case "outOfStock":
        where.stock = 0;
        break;
      case "lowStock":
        where.stock = { lt: 10, gt: 0 };
        break;
      // "all" ne filtre rien
    }

    // Récupération des produits avec pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Correction : Toujours fournir une imageUrl (Cloudinary ou placeholder)
    const productsWithImage = products.map(product => ({
      ...product,
      imageUrl: product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : '/placeholder.png',
      images: product.images ? JSON.parse(product.images) : [],
    }));

    // Retour des données
    return NextResponse.json({
      products: productsWithImage,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Crée un nouveau produit
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification et des permissions admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    // Récupération des données du produit
    const body = await request.json();
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
      attributes,
      isBest,
    } = body;

    // Validation des données requises
    if (!name || !slug || !description || !price || !categoryId || stock === undefined || stock === '') {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis, y compris le stock." },
        { status: 400 }
      );
    }

    const stockInt = parseInt(stock as string, 10);
    if (isNaN(stockInt)) {
      return NextResponse.json(
        { error: 'La quantité en stock doit être un nombre valide.' },
        { status: 400 }
      );
    }

    // Vérification que le slug est unique
    const existingProductBySlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProductBySlug) {
      return NextResponse.json(
        { error: "Un produit avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Vérification que le SKU est unique (si fourni)
    if (sku) {
      const existingProductBySku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingProductBySku) {
        return NextResponse.json(
          { error: "Un produit avec ce SKU existe déjà" },
          { status: 400 }
        );
      }
    }

    // Vérification que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "La catégorie sélectionnée n'existe pas" },
        { status: 400 }
      );
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: stockInt,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        categoryId,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        isBest: Boolean(isBest),
        imageUrl: imageUrl || null,
        images: Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : '[]',
        attributes: attributes || null,
        status: 'PUBLISHED',
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

    // Ajout des variantes si fournies
    if (body.variants && Array.isArray(body.variants)) {
      interface VariantData {
        name: string;
        value: string;
        price: string | number;
        stock?: string | number;
      }
      const variantsToCreate = body.variants
        .filter((v: VariantData) => v.name && v.value && v.price !== undefined)
        .map((v: VariantData) => ({
          productId: product.id,
          name: v.name,
          value: v.value,
          price: parseFloat(v.price.toString()),
          stock: parseInt(v.stock?.toString() || '0'),
        }));
      if (variantsToCreate.length > 0) {
        await prisma.productVariant.createMany({ data: variantsToCreate });
      }
    }

    return NextResponse.json(
      { 
        message: "Produit créé avec succès",
        product 
      },
      { status: 201 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    console.error("Erreur détaillée lors de la création du produit:", error);
    return NextResponse.json(
      { error: `Erreur serveur lors de la création du produit: ${errorMessage}` },
      { status: 500 }
    );
  }
}