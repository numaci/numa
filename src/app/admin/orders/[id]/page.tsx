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
  if (!str) return { raw: '' } as const;
  try {
    const parsed = JSON.parse(str);
    return { isParsed: true, data: parsed } as const;
  } catch (e) {
    return { raw: str } as const;
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
              imageUrl: true,
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
      .map(item => {
        // Safely parse images JSON string into array if possible
        let parsedImages: string[] = []
        const rawImages = item.product!.images as unknown as string | null
        if (rawImages) {
          try {
            const arr = JSON.parse(rawImages)
            if (Array.isArray(arr)) parsedImages = arr.filter(Boolean)
          } catch {/* ignore */}
        }
        const primaryImage = item.product!.imageUrl || parsedImages[0] || null
        return ({
          id: item.id,
          quantity: item.quantity,
          price: item.price.toNumber(),
          product: {
            id: item.product!.id,
            name: item.product!.name,
            imageUrl: primaryImage,
            sku: item.product!.sku,
            stock: item.product!.stock,
          },
        })
      }),
    shippingAddress: (() => {
      const v = safeJsonParse(order.shippingAddress);
      if (v && 'isParsed' in v && v.isParsed) {
        const data = { ...v.data } as any;
        // Normalize: ensure 'address' exists for UI; alias from 'street'
        if (!data.address && data.street) data.address = data.street;
        return { isParsed: true, data } as const;
      }
      return v;
    })(),
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