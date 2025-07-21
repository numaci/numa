import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orderId = params.id;

    // Récupérer la commande avec tous les détails
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id, // Seulement les commandes de l'utilisateur connecté
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              }
            }
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // Parser les données JSON stockées et convertir les Decimal
    const parsedOrder = {
      ...order,
      total: order.total.toNumber(),
      shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
      deliveryZone: order.deliveryZone ? JSON.parse(order.deliveryZone) : null,
      paymentInfo: order.paymentInfo ? JSON.parse(order.paymentInfo) : null,
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: item.price.toNumber(),
      }))
    };

    return NextResponse.json({
      success: true,
      order: parsedOrder,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la commande" }, { status: 500 });
  }
} 