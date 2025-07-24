import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id]/order-count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params;
    // Compter le nombre d'order_items pour ce produit
    const count = await prisma.orderItem.count({
      where: { productId: id },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erreur lors du comptage des commandes pour le produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 