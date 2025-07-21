import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrderDetailsAdmin from "@/components/admin/orders/OrderDetailsAdmin";

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

async function getOrderDetails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              supplier: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  }) as any;

  if (!order) {
    return null;
  }

  // Convertir les objets Decimal en number et parser les JSON
  const serializedOrder = {
    ...order,
    total: order.total.toNumber(),
    orderItems: order.orderItems.map((item: any) => ({
      ...item,
      price: item.price.toNumber(),
      product: {
        ...item.product,
        supplier: item.product.supplier
          ? { id: item.product.supplier.id, name: item.product.supplier.name, email: item.product.supplier.email }
          : null,
      },
    })),
    shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
    deliveryZone: order.deliveryZone ? JSON.parse(order.deliveryZone) : null,
    paymentInfo: order.paymentInfo ? JSON.parse(order.paymentInfo) : null,
  };

  return serializedOrder;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const order = await getOrderDetails(params.id);

  if (!order) {
    redirect("/admin/orders");
  }

  return <OrderDetailsAdmin order={order} />;
} 