import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';
import { z } from "zod";

// Schéma de validation pour la mise à jour du produit
const productSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être un nombre positif").optional(),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBest: z.boolean().optional(),
  // Autoriser aussi les chemins locaux (ex: /uploads/..)
  imageUrl: z.string().optional(),
  // Accepter soit une string JSON, soit un tableau d'URLs
  images: z.union([z.string(), z.array(z.string())]).optional(),
  comparePrice: z.number().nullable().optional(),
  shippingPrice: z.number().nullable().optional(),
});

// GET /api/admin/products/[id] - Récupère un produit spécifique
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Sérialisation des Decimals pour éviter les erreurs JSON
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
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Modifie un produit existant
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = productSchema.partial().safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.issues }, { status: 400 });
    }

    // Normaliser le champ images en string JSON si un tableau est fourni et assainir les champs
    const data: any = { ...parsedData.data };
    if (Array.isArray(data.images)) {
      data.images = JSON.stringify(data.images);
    }

    // Convertir les chaînes vides en undefined pour éviter des erreurs Prisma/contraintes
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'string' && data[key].trim() === '') {
        data[key] = undefined;
      }
    }

    // Catégorie: ignorer si vide/non définie
    if (data.categoryId === '') data.categoryId = undefined;

    // Image principale: ignorer si vide
    if (data.imageUrl === '') data.imageUrl = undefined;

    // Coercitions numériques sécurisées
    if (data.price !== undefined) {
      const p = Number(data.price);
      if (Number.isNaN(p)) {
        return NextResponse.json({ error: [{ path: ['price'], message: 'Prix invalide' }] }, { status: 400 });
      }
      data.price = p;
    }
    if (data.stock !== undefined) {
      const s = Number(data.stock);
      if (!Number.isInteger(s) || s < 0) {
        return NextResponse.json({ error: [{ path: ['stock'], message: 'Stock invalide' }] }, { status: 400 });
      }
      data.stock = s;
    }
    if (data.comparePrice !== undefined) {
      if (data.comparePrice === null) {
        // ok
      } else {
        const cp = Number(data.comparePrice);
        if (Number.isNaN(cp)) {
          return NextResponse.json({ error: [{ path: ['comparePrice'], message: 'Prix comparé invalide' }] }, { status: 400 });
        }
        data.comparePrice = cp;
      }
    }
    if (data.shippingPrice !== undefined) {
      if (data.shippingPrice === null) {
        // ok
      } else {
        const sp = Number(data.shippingPrice);
        if (Number.isNaN(sp)) {
          return NextResponse.json({ error: [{ path: ['shippingPrice'], message: 'Prix de livraison invalide' }] }, { status: 400 });
        }
        data.shippingPrice = sp;
      }
    }

    // Gestion des variantes (relation) via nested writes
    let variantsNested: any = undefined;
    if (Array.isArray(body.variants)) {
      const incoming = body.variants as any[];
      delete data.variants;
      
      // Récupérer les variantes existantes
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
      });
      
      // Préparer les opérations pour chaque variante
      const operations: any[] = [];
      const processedIds = new Set<string>();
      
      for (const incomingVariant of incoming) {
        if (!incomingVariant || (incomingVariant.value ?? '').trim() === '') continue;
        
        const variantData = {
          name: (incomingVariant.name ?? 'Taille') as string,
          value: String(incomingVariant.value).trim(),
          price: Number(incomingVariant.price ?? 0),
          stock: Number.isFinite(Number(incomingVariant.stock)) ? Number(incomingVariant.stock) : 0,
        };
        
        // Chercher une variante existante avec la même valeur
        const existing = existingVariants.find(
          ev => ev.value === variantData.value && !processedIds.has(ev.id)
        );
        
        if (existing) {
          // Mettre à jour la variante existante
          operations.push({
            where: { id: existing.id },
            update: variantData,
            create: variantData, // Requis par Prisma même si on met à jour
          });
          processedIds.add(existing.id);
        } else {
          // Créer une nouvelle variante
          operations.push({
            where: { id: '__new__' + Math.random() }, // ID temporaire qui ne matchera jamais
            update: variantData,
            create: variantData,
          });
        }
      }
      
      // Supprimer les variantes qui ne sont plus présentes
      const idsToDelete = existingVariants
        .filter(ev => !processedIds.has(ev.id))
        .map(ev => ev.id);
      
      variantsNested = {
        deleteMany: idsToDelete.length > 0 ? { id: { in: idsToDelete } } : undefined,
        upsert: operations.length > 0 ? operations : undefined,
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(variantsNested ? { variants: variantsNested } : {}),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Supprime un produit
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true, images: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const imagePaths = [];
    if (product.imageUrl) {
      imagePaths.push(product.imageUrl);
    }
    if (product.images) {
      try {
        const secondaryImages = JSON.parse(product.images as string);
        if (Array.isArray(secondaryImages)) {
          imagePaths.push(...secondaryImages);
        }
      } catch (e) {
        console.error('Erreur de parsing JSON pour les images secondaires:', e);
      }
    }

    for (const imagePath of imagePaths) {
      if (typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        try {
          await fs.unlink(fullPath);
        } catch (fsError: any) {
          if (fsError.code !== 'ENOENT') {
            console.error(`Impossible de supprimer l'image: ${fullPath}`, fsError);
          }
        }
      }
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Produit et images associées supprimés avec succès' });

  } catch (error: any) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json({ error: 'Une erreur est survenue lors de la suppression du produit.' }, { status: 500 });
  }
}