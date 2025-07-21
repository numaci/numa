import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrderTable from "@/components/admin/orders/OrderTable";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import PageHeader from "@/components/admin/orders/PageHeader";
import Pagination from "@/components/admin/orders/Pagination";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
  }>;
}

async function getOrders(searchParams: Promise<OrdersPageProps["searchParams"]>) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Construction des filtres
  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { orderNumber: { contains: params.search, mode: "insensitive" } },
      { user: { firstName: { contains: params.search, mode: "insensitive" } } },
      { user: { lastName: { contains: params.search, mode: "insensitive" } } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.status && params.status !== "all") {
    where.status = params.status;
  }

  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) {
      where.createdAt.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.createdAt.lte = new Date(params.endDate);
    }
  }

  if (params.minAmount || params.maxAmount) {
    where.total = {};
    if (params.minAmount) {
      where.total.gte = parseFloat(params.minAmount);
    }
    if (params.maxAmount) {
      where.total.lte = parseFloat(params.maxAmount);
    }
  }

  // Récupération des commandes avec pagination
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
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
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  // Convertir les objets Decimal en number pour éviter les erreurs de sérialisation
  const serializedOrders = orders.map(order => ({
    ...order,
    total: order.total.toNumber(),
    orderItems: order.orderItems.map(item => ({
      ...item,
      price: item.price.toNumber(),
    }))
  }));

  return {
    orders: serializedOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const { orders, total, page, totalPages } = await getOrders(searchParams);
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader />
      
      <OrderFilters />
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Commandes ({total})
            </h2>
          </div>
        </div>
        
        <OrderTable orders={orders} />
        
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          searchParams={params}
        />
      </div>
    </div>
  );
} 