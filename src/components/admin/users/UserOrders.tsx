import { prisma } from '@/lib/prisma'
import { Package, Calendar, Euro } from 'lucide-react'
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
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800'
      case 'PAYMENT_VERIFIED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-purple-100 text-purple-800'
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'En attente de paiement'
      case 'PAYMENT_VERIFIED': return 'Paiement vérifié'
      case 'PROCESSING': return 'En traitement'
      case 'SHIPPED': return 'Expédiée'
      case 'DELIVERED': return 'Livrée'
      case 'CANCELLED': return 'Annulée'
      case 'REFUNDED': return 'Remboursée'
      default: return status
    }
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(num);
  }

  return (
    <div className="admin-card">
      <h2 className="text-2xl font-bold text-black mb-6">
        Historique des Commandes ({orders.length})
      </h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-300 rounded-xl bg-gray-50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-bold text-black">
                      Commande #{order.orderNumber}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Euro className="h-4 w-4" />
                        <span className="font-semibold">{formatCurrency(Number(order.total))}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`admin-status-badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Articles commandés:</h4>
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="text-gray-500">Quantité: {item.quantity}</p>
                        {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(Number(item.price))} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total de la commande:</span>
                  <span className="text-xl font-bold text-black">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Aucune commande trouvée</p>
          <p className="text-gray-400 text-sm">Ce client n'a pas encore passé de commande</p>
        </div>
      )}
    </div>
  )
}