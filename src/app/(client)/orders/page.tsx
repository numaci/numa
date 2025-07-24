"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimes, FaUndo } from "react-icons/fa";
import Image from "next/image";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        label: "En attente de vérification",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: FaClock,
      };
    case "PAYMENT_VERIFIED":
      return {
        label: "Paiement vérifié",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: FaCheckCircle,
      };
    case "PROCESSING":
      return {
        label: "En cours de traitement",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        icon: FaClipboardList,
      };
    case "SHIPPED":
      return {
        label: "Expédiée",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        icon: FaTruck,
      };
    case "DELIVERED":
      return {
        label: "Livrée",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: FaCheckCircle,
      };
    case "CANCELLED":
      return {
        label: "Annulée",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: FaTimes,
      };
    case "REFUNDED":
      return {
        label: "Remboursée",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaUndo,
      };
    default:
      return {
        label: status,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaClipboardList,
      };
  }
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos commandes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaClipboardList className="text-2xl text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
          </div>
          <p className="text-gray-600">
            Consultez l'historique et le statut de toutes vos commandes
          </p>
        </div>
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/90 rounded-2xl shadow-md border p-8 text-center">
            <FaClipboardList className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n&#39;avez pas encore de commandes.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-colors font-semibold"
            >
              Découvrir nos produits
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div key={order.id} className="bg-white/90 rounded-2xl shadow-md border hover:shadow-xl hover:border-amber-400 transition-all duration-300 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.orderNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="text-base" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 md:mt-0">
                      Passée le {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Order Items */}
                  <div className="p-6">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 mb-4">
                        {item.product.imageUrl ? (
                          <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="w-16 h-16 rounded-xl shadow border border-amber-100 object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-xl shadow border border-amber-100">
                            📦
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{item.product.name}</div>
                          <div className="text-gray-500 text-sm">x{item.quantity}</div>
                        </div>
                        <div className="font-bold text-amber-600">
                          {formatCurrency(item.price, order.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Order Total */}
                  <div className="px-6 pb-6 flex justify-end">
                    <div className="text-lg font-bold text-gray-900">
                      Total : {formatCurrency(order.total, order.currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 