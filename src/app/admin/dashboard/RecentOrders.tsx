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
  DELIVERED: "bg-green-600 text-white",
  SHIPPED: "bg-blue-600 text-white",
  PROCESSING: "bg-yellow-500 text-yellow-900",
  CANCELLED: "bg-red-600 text-white",
  DEFAULT: "bg-gray-400 text-white"
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ recentOrders }) => (
  <div className="admin-table">
    <div className="admin-table-header">
      <FiClock className="text-gray-700" size={22} />
      <h3 className="text-lg font-semibold text-black tracking-tight antialiased">Commandes récentes</h3>
    </div>
    <div className="overflow-visible">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="admin-table-th">Commande</th>
            <th className="admin-table-th">Client</th>
            <th className="admin-table-th">Montant</th>
            <th className="admin-table-th">Statut</th>
            <th className="admin-table-th">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentOrders.map((order) => (
            <tr key={order.id} className="admin-table-row">
              <td className="admin-table-td text-sm font-semibold text-black antialiased">#{order.id.slice(-6)}</td>
              <td className="admin-table-td text-sm text-gray-700 antialiased">Client #{order.id.slice(-3)}</td>
              <td className="admin-table-td text-sm text-black font-semibold antialiased">{formatCurrency(order.total)}</td>
              <td className="admin-table-td">
                <span className={`admin-status-badge ${statusStyles[order.status as keyof typeof statusStyles] || statusStyles.DEFAULT}`}>
                  {order.status}
                </span>
              </td>
              <td className="admin-table-td text-sm text-gray-600 antialiased">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentOrders; 