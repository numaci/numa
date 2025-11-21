import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrderTable from "@/components/admin/orders/OrderTable";
import Pagination from "@/components/admin/orders/Pagination";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function getOrders(searchParams: OrdersPageProps["searchParams"]) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Récupération de toutes les commandes avec pagination (sans filtrage)
  const [rawOrders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
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
    prisma.order.count(),
  ]);

  // Convertir les objets Decimal en number pour éviter les erreurs de sérialisation
  const orders = rawOrders.map((order) => ({
    ...order,
    total: order.total.toNumber(),
    orderItems: order.orderItems.map((item) => {
      // Gérer le cas où le produit a été supprimé
      if (!item.product) {
        const deletedProduct = {
          id: `deleted-${item.id}`,
          name: 'Produit supprimé',
          slug: 'produit-supprime',
          description: 'Ce produit a été retiré de la vente.',
          price: 0,
          comparePrice: null,
          stock: 0,
          sku: 'DELETED',
          imageUrl: '/placeholder.png',
          images: '[]',
          isFeatured: false,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoryId: 'deleted-category-id',
          supplierId: null,
          tags: '[]',
          category: { id: 'deleted-category', name: 'N/A', slug: 'n-a' },
          weight: null,
          dimensions: null,
        };

        return {
          ...item,
          productId: item.productId ?? 'ID_PRODUIT_SUPPRIME',
          price: item.price.toNumber(),
          product: deletedProduct,
        };
      }

      // Si le produit existe, continuer normalement
      return {
        ...item,
        productId: item.productId!, // Assurer que productId n'est jamais null
        price: item.price.toNumber(),
        product: {
          ...item.product,
          price: item.product.price.toNumber(),
          comparePrice: item.product.comparePrice?.toNumber() ?? null,
        },
      };
    }),
  }));

  return {
    orders,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header moderne */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 antialiased">📎 Gestion des Commandes</h1>
          <p className="text-gray-600 mt-1 antialiased">
            Suivez et gérez toutes les commandes de votre boutique de vêtements NUMA
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="admin-card">
        {/* Header du tableau */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 antialiased">
              📈 Liste des commandes ({total})
            </h2>
            <div className="text-sm text-gray-600 antialiased">
              {total === 0 ? 'Aucune commande' : `${total} commande${total > 1 ? 's' : ''} au total`}
            </div>
          </div>
        </div>
        
        <OrderTable orders={orders} />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              searchParams={{}}
            />
          </div>
        )}
      </div>
    </div>
  );
}