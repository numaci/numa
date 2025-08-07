"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus, Order } from "@/types/admin";
import { MoreVertical, Eye, Trash2 } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  onDelete?: (orderId: string) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "⏳ En attente";
    case "PROCESSING":
      return "🔄 En préparation";
    case "SHIPPED":
      return "📦 Expédiée";
    case "DELIVERED":
      return "✅ Livrée";
    case "CANCELLED":
      return "❌ Annulée";
    case "REFUNDED":
      return "Remboursée";
    default:
      return status;
  }
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, onDelete }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  if (orders.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-4xl">📦</div>
          <p className="text-gray-500 antialiased">Aucune commande trouvée</p>
          <p className="text-sm text-gray-400 antialiased">
            Les commandes de votre boutique de vêtements apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              📋 Commande
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              👤 Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              👕 Articles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              💰 Montant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              📊 Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              📅 Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
              ⚙️ Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 antialiased">
                  #{order.orderNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 antialiased">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 antialiased">
                      {order.user.email || order.user.phone}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {order.orderItems.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="text-sm text-gray-900 antialiased">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-1">(×{item.quantity})</span>
                    </div>
                  ))}
                  {order.orderItems.length > 2 && (
                    <div className="text-xs text-gray-500 antialiased">
                      +{order.orderItems.length - 2} autre{order.orderItems.length - 2 > 1 ? 's' : ''} article{order.orderItems.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900 antialiased">
                  {formatCurrency(order.total)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium antialiased ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "CANCELLED" || order.status === "REFUNDED"
                    ? "bg-red-100 text-red-800"
                    : order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "PROCESSING"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "SHIPPED"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 antialiased">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    title="Actions sur la commande"
                    onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === order.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => { window.location.href = `/admin/orders/${order.id}`; setOpenMenu(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 antialiased"
                        >
                          <Eye className="w-4 h-4" /> 
                          <span>Voir les détails</span>
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => { onDelete(order.id); setOpenMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 antialiased"
                          >
                            <Trash2 className="w-4 h-4" /> 
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable; 