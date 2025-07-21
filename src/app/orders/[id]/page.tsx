"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency, formatGPS, getGoogleMapsLink, generateOrderShareLink } from "@/lib/utils";
import ClientLayout from "@/components/layout/ClientLayout";
import { FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimes, FaUndo, FaArrowLeft, FaMapMarkerAlt, FaPhone, FaCreditCard, FaShare, FaCopy } from "react-icons/fa";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  shippingAddress: Record<string, unknown>;
  deliveryZone: Record<string, unknown>;
  paymentInfo: Record<string, unknown>;
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
        description: "Votre paiement est en cours de vérification par notre équipe."
      };
    case "PAYMENT_VERIFIED":
      return {
        label: "Paiement vérifié",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: FaCheckCircle,
        description: "Votre paiement a été vérifié. Votre commande va être préparée."
      };
    case "PROCESSING":
      return {
        label: "En cours de traitement",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        icon: FaClipboardList,
        description: "Votre commande est en cours de préparation."
      };
    case "SHIPPED":
      return {
        label: "Expédiée",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        icon: FaTruck,
        description: "Votre commande a été expédiée et est en route vers vous."
      };
    case "DELIVERED":
      return {
        label: "Livrée",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: FaCheckCircle,
        description: "Votre commande a été livrée avec succès."
      };
    case "CANCELLED":
      return {
        label: "Annulée",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: FaTimes,
        description: "Cette commande a été annulée."
      };
    case "REFUNDED":
      return {
        label: "Remboursée",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaUndo,
        description: "Cette commande a été remboursée."
      };
    default:
      return {
        label: status,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaClipboardList,
        description: "Statut de commande."
      };
  }
};

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDeliveryTime, setNewDeliveryTime] = useState("");
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [deliveryUpdateMessage, setDeliveryUpdateMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && orderId) {
      fetchOrderDetails();
    }
  }, [status, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Commande non trouvée");
        }
        throw new Error("Erreur lors de la récupération des détails");
      }

      const data = await response.json();
      setOrder(data.order);
      setNewDeliveryTime(data.order.deliveryZone?.deliveryTime || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryTimeUpdate = async () => {
    if (newDeliveryTime === order?.deliveryZone?.deliveryTime) return;

    setIsUpdatingDelivery(true);
    setDeliveryUpdateMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deliveryTime: newDeliveryTime 
        }),
      });

      if (response.ok) {
        setDeliveryUpdateMessage("Délai de livraison mis à jour avec succès !");
        // Recharger les données
        setTimeout(() => {
          fetchOrderDetails();
        }, 1000);
      } else {
        const error = await response.json();
        setDeliveryUpdateMessage(`Erreur: ${error.error}`);
      }
    } catch (error) {
      setDeliveryUpdateMessage("Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      const shareLink = generateOrderShareLink(
        order.orderNumber,
        order.orderItems,
        order.shippingAddress
      );
      
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // console.error('Erreur lors de la copie:', err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirection en cours
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FaTimes className="text-4xl text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Erreur</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/orders")}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Retour aux commandes
              </button>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return null;
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header reçu */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Commande #{order.orderNumber}</h1>
                <p className="text-amber-100 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 text-right">
                <button
                  onClick={handleShareOrder}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow transition-colors"
                >
                  {copied ? <FaCopy /> : <FaShare />}
                  {copied ? "Lien copié !" : "Partager le reçu"}
                </button>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white shadow`}> 
                  <StatusIcon className="w-4 h-4 text-white" />
                  {statusInfo.label}
                </div>
              </div>
            </div>
            {/* Retour */}
            <div className="px-6 pt-6">
              <button
                onClick={() => router.push("/orders")}
                className="flex items-center gap-2 text-amber-600 hover:text-orange-600 font-semibold mb-4"
              >
                <FaArrowLeft />
                Retour aux commandes
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Description */}
                <div className="bg-amber-50 rounded-xl shadow p-6">
                  <h2 className="text-lg font-bold text-amber-600 mb-2">Statut de la commande</h2>
                  <p className="text-gray-700">{statusInfo.description}</p>
                </div>
                {/* Admin: Update Delivery Time Section */}
                {session?.user?.role === "ADMIN" && order.deliveryZone && (
                  <div className="bg-orange-50 rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-orange-600 mb-2">Modifier le délai de livraison (Admin)</h2>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={newDeliveryTime}
                        onChange={(e) => setNewDeliveryTime(e.target.value)}
                        placeholder="Ex: 30-45 minutes"
                        className="px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 flex-1"
                      />
                      <button
                        onClick={handleDeliveryTimeUpdate}
                        disabled={isUpdatingDelivery || newDeliveryTime === order.deliveryZone?.deliveryTime}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingDelivery ? "Mise à jour..." : "Mettre à jour"}
                      </button>
                    </div>
                    {deliveryUpdateMessage && (
                      <p className={`mt-2 text-sm ${deliveryUpdateMessage.includes("Erreur") ? "text-red-600" : "text-green-600"}`}>
                        {deliveryUpdateMessage}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Délai actuel : <span className="font-medium">{order.deliveryZone?.deliveryTime}</span>
                    </p>
                  </div>
                )}
                {/* Order Items */}
                <div className="bg-white/90 rounded-xl shadow overflow-hidden">
                  <div className="p-6 border-b border-amber-100">
                    <h2 className="text-lg font-bold text-amber-600">Articles commandés</h2>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={item.product.imageUrl || "/placeholder.png"}
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover border border-amber-100"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              Quantité: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-600">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-amber-50 rounded-xl shadow p-6">
                  <h2 className="text-lg font-bold text-amber-600 mb-2">Résumé de la commande</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-semibold">
                        {formatCurrency(order.total - (order.deliveryZone?.deliveryFee || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraison</span>
                      <span className="font-semibold">
                        {formatCurrency(order.deliveryZone?.deliveryFee || 0)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-amber-600">Total</span>
                        <span className="font-bold text-lg text-orange-600">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="bg-orange-50 rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-orange-600 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-orange-500" />
                      Adresse de livraison
                    </h2>
                    <div className="text-gray-700">
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>{order.shippingAddress.city}</p>
                      {order.shippingAddress.phone && (
                        <p className="mt-2 flex items-center gap-2">
                          <FaPhone className="text-orange-500" />
                          {order.shippingAddress.phone}
                        </p>
                      )}
                      {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm font-medium text-amber-900 mb-1">Coordonnées GPS :</p>
                          <p className="text-sm text-amber-700 font-mono mb-2">
                            {formatGPS(order.shippingAddress.latitude, order.shippingAddress.longitude)}
                          </p>
                          <a
                            href={getGoogleMapsLink(order.shippingAddress.latitude, order.shippingAddress.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors"
                          >
                            <FaMapMarkerAlt />
                            Ouvrir dans Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Payment Info */}
                {order.paymentInfo && (
                  <div className="bg-amber-50 rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-amber-600 mb-2 flex items-center gap-2">
                      <FaCreditCard className="text-amber-500" />
                      Informations de paiement
                    </h2>
                    <div className="text-gray-700">
                      <p className="flex items-center gap-2">
                        <FaPhone className="text-amber-500" />
                        {order.paymentInfo.clientPhone}
                      </p>
                      {/* Autres infos paiement ici si besoin */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 