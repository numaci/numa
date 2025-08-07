import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';
import { z } from "zod";

// Schéma de validation pour la mise à jour du produit
const productSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").optional(),
  price: z.number().positive("Le prix doit être un nombre positif").optional(),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").optional(),
  categoryId: z.string().cuid("ID de catégorie invalide").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBest: z.boolean().optional(),
  imageUrl: z.string().url("URL de l'image invalide").optional(),
  images: z.string().optional(), // Le JSON est une string
  comparePrice: z.number().optional(),
  shippingPrice: z.number().optional(),
});

// GET /api/admin/products/[id] - Récupère un produit spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = productSchema.partial().safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: parsedData.data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Supprime un produit
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

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