"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/admin";
import { MoreVertical, Eye, Trash2 } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

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
      return "En attente de paiement";
    case "PROCESSING":
      return "Paiement vérifié";
    case "SHIPPED":
      return "En cours de livraison";
    case "DELIVERED":
      return "Livrée";
    case "CANCELLED":
      return "Annulée";
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
        <p className="text-gray-500">Aucune commande trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-orange-100 text-sm md:text-base bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
        <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl whitespace-nowrap">Commande</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Client</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Produits</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Montant</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Statut</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/70 divide-y divide-orange-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-orange-50/60 transition">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-orange-900 font-semibold">
                #{order.orderNumber}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-orange-900 font-semibold">
                  {order.user.firstName} {order.user.lastName}
                </div>
                <div className="text-xs text-orange-400">
                  {order.user.email ? order.user.email : order.user.phone}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="space-y-1">
                  {order.orderItems.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="text-sm text-orange-900">
                      {item.name} (x{item.quantity})
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="text-xs text-orange-400">
                      +{order.orderItems.length - 3} autres
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-orange-900 font-semibold">
                {formatCurrency(order.total)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow ${
                  order.status === "DELIVERED"
                    ? "bg-gradient-to-r from-green-200 to-green-400 text-green-900"
                    : order.status === "CANCELLED" || order.status === "REFUNDED"
                    ? "bg-gradient-to-r from-red-200 to-red-400 text-red-900"
                    : order.status === "PENDING"
                    ? "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900"
                    : order.status === "PROCESSING"
                    ? "bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900"
                    : order.status === "SHIPPED"
                    ? "bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900"
                    : "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900"
                }`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs text-orange-400">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end">
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-orange-100 text-orange-600 hover:text-orange-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
                    title="Actions"
                    onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === order.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
                      <button
                        onClick={() => { window.location.href = `/admin/orders/${order.id}`; setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-t-xl transition"
                      >
                        <Eye className="w-4 h-4" /> Voir détails
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => { onDelete(order.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-xl transition"
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      )}
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