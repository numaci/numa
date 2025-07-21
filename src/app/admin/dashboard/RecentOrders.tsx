import React from "react";
import { formatCurrency } from "@/lib/utils";
import { FiClock } from "react-icons/fi";

interface RecentOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}

interface RecentOrdersProps {
  recentOrders: RecentOrder[];
}

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} secondes ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

const statusStyles = {
  DELIVERED: "bg-gradient-to-r from-green-400 to-green-600 text-white",
  SHIPPED: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
  PROCESSING: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900",
  CANCELLED: "bg-gradient-to-r from-red-400 to-red-600 text-white",
  DEFAULT: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800"
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ recentOrders }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white rounded-t-2xl">
      <FiClock className="text-orange-500" size={22} />
      <h3 className="text-lg font-bold text-orange-700">Commandes récentes</h3>
    </div>
    <div className="overflow-visible">
      <table className="min-w-full divide-y divide-orange-100">
        <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl">Commande</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider">Montant</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white/70 divide-y divide-orange-50">
          {recentOrders.map((order) => (
            <tr key={order.id} className="hover:bg-orange-50/60 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-900">#{order.orderNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-900">{order.user.firstName} {order.user.lastName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">{formatCurrency(order.total)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow ${statusStyles[order.status] || statusStyles.DEFAULT}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentOrders; 