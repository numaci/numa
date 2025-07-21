import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { status, deliveryTime } = body;

    // Récupérer la commande actuelle pour obtenir les données existantes
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    const updateData: any = {};

    // Mise à jour du statut si fourni
    if (status) {
      const validStatuses = [
        "PENDING_PAYMENT",
        "PAYMENT_VERIFIED", 
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED"
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      updateData.status = status;
    }

    // Mise à jour du délai de livraison si fourni
    if (deliveryTime) {
      const currentDeliveryZone = currentOrder.deliveryZone ? JSON.parse(currentOrder.deliveryZone) : {};
      const updatedDeliveryZone = {
        ...currentDeliveryZone,
        deliveryTime: deliveryTime
      };
      updateData.deliveryZone = JSON.stringify(updatedDeliveryZone);
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    const message = status && deliveryTime 
      ? "Statut et délai de livraison mis à jour avec succès"
      : status 
        ? "Statut de la commande mis à jour avec succès"
        : "Délai de livraison mis à jour avec succès";

    return NextResponse.json({
      success: true,
      message: message,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        total: updatedOrder.total.toNumber(),
        user: updatedOrder.user
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orderId = params.id;

    // Récupérer la commande avec tous les détails
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orderId = params.id;

    // Supprimer d'abord les orderItems liés à la commande
    await prisma.orderItem.deleteMany({ where: { orderId } });

    // Puis supprimer la commande
    await prisma.order.delete({ where: { id: orderId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
} 