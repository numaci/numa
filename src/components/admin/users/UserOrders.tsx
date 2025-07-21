import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { Package, Calendar, Euro } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from "next/image";

interface UserOrdersProps {
  userId: string
}

export async function UserOrders({ userId }: UserOrdersProps) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary'
      case 'PROCESSING': return 'default'
      case 'SHIPPED': return 'default'
      case 'DELIVERED': return 'default'
      case 'CANCELLED': return 'destructive'
      case 'REFUNDED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'PROCESSING': return 'En cours'
      case 'SHIPPED': return 'Expédiée'
      case 'DELIVERED': return 'Livrée'
      case 'CANCELLED': return 'Annulée'
      case 'REFUNDED': return 'Remboursée'
      default: return status
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8">
      <h2 className="text-2xl font-extrabold text-orange-700 mb-4">
        Historique des Commandes
      </h2>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-orange-100 rounded-2xl bg-orange-50/40 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-orange-400" />
                  <div>
                    <h3 className="font-bold text-orange-800">
                      Commande #{order.orderNumber}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-orange-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Euro className="h-4 w-4" />
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-orange-100 rounded flex items-center justify-center border border-orange-100">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-orange-800">{item.name}</p>
                        <p className="text-orange-400">Quantité: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-orange-800">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-orange-400 mb-4" />
          <p className="text-orange-400">Aucune commande trouvée</p>
        </div>
      )}
    </div>
  )
} 