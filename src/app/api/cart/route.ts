import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer le panier de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
            isActive: true
          }
        }
      }
    });

    // Filtrer les produits inactifs et formater les données
    const validItems = cartItems
      .filter(item => item.product.isActive)
      .map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: Number(item.product.price),
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
        quantity: item.quantity
      }));

    return NextResponse.json({ items: validItems });

  } catch (error) {
    console.error("Erreur lors de la récupération du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un produit au panier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est actif
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé ou indisponible" },
        { status: 404 }
      );
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 400 }
      );
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      // Mettre à jour la quantité
      const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
      
      const updatedItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId
          }
        },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true
            }
          }
        }
      });

      return NextResponse.json({
        message: "Quantité mise à jour",
        item: {
          productId: updatedItem.productId,
          name: updatedItem.product.name,
          price: Number(updatedItem.product.price),
          imageUrl: updatedItem.product.imageUrl,
          stock: updatedItem.product.stock,
          quantity: updatedItem.quantity
        }
      });
    } else {
      // Ajouter un nouvel article
      const newItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: Math.min(quantity, product.stock)
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true
            }
          }
        }
      });

      return NextResponse.json({
        message: "Produit ajouté au panier",
        item: {
          productId: newItem.productId,
          name: newItem.product.name,
          price: Number(newItem.product.price),
          imageUrl: newItem.product.imageUrl,
          stock: newItem.product.stock,
          quantity: newItem.quantity
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la quantité d'un produit
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "ID du produit et quantité requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est actif
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé ou indisponible" },
        { status: 404 }
      );
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 400 }
      );
    }

    // Mettre à jour la quantité
    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      },
      data: { quantity: Math.max(1, Math.min(quantity, product.stock)) },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Quantité mise à jour",
      item: {
        productId: updatedItem.productId,
        name: updatedItem.product.name,
        price: Number(updatedItem.product.price),
        imageUrl: updatedItem.product.imageUrl,
        stock: updatedItem.product.stock,
        quantity: updatedItem.quantity
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit du panier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Supprimer l'article du panier
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    return NextResponse.json({
      message: "Produit supprimé du panier"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 