import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrderDetailsAdmin from "@/components/admin/orders/OrderDetailsAdmin";
import { Order, OrderStatus, PaymentStatus } from "@/types/order-types";

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

const safeJsonParse = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return { raw: str };
  }
};

async function getOrderDetails(orderId: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              stock: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!order || !order.user) {
    return null;
  }

  const serializedOrder: Order = {
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total.toNumber(),
    status: order.status as OrderStatus, // Cast Prisma enum to our custom type
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
    },
    orderItems: order.orderItems
      .filter(item => item.product)
      .map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price.toNumber(),
        product: {
          id: item.product!.id,
          name: item.product!.name,
          imageUrl: item.product!.images?.[0] || null,
          sku: item.product!.sku,
          stock: item.product!.stock,
        },
      })),
    shippingAddress: safeJsonParse(order.shippingAddress),
    deliveryZone: safeJsonParse(order.deliveryZone),
    paymentInfo: safeJsonParse(order.paymentInfo),
  };

  return serializedOrder;
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    redirect("/admin/orders");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <a 
            href="/admin/orders"
            className="admin-button-secondary"
          >
            ← Retour aux commandes
          </a>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 antialiased">
            📦 Commande #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1 antialiased">
            Détails de la commande passée par {order.user.firstName} {order.user.lastName}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="admin-card">
        <OrderDetailsAdmin order={order} />
      </div>
    </div>
  );
} 