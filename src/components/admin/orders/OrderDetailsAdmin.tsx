"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatGPS, getGoogleMapsLink, generateOrderShareLink } from "@/lib/utils";
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaCreditCard, FaTruck, FaCheckCircle, FaTimes, FaClock, FaUndo, FaShare, FaCopy } from "react-icons/fa";
import { Trash2, MoreVertical } from "lucide-react";

interface OrderDetailsAdminProps {
  order: Record<string, unknown>;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        label: "En attente de vérification",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: FaClock,
        description: "Le paiement est en cours de vérification"
      };
    case "PAYMENT_VERIFIED":
      return {
        label: "Paiement vérifié",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: FaCheckCircle,
        description: "Le paiement a été vérifié et validé"
      };
    case "PROCESSING":
      return {
        label: "En cours de traitement",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        icon: FaTruck,
        description: "La commande est en cours de préparation"
      };
    case "SHIPPED":
      return {
        label: "Expédiée",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        icon: FaTruck,
        description: "La commande a été expédiée"
      };
    case "DELIVERED":
      return {
        label: "Livrée",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: FaCheckCircle,
        description: "La commande a été livrée avec succès"
      };
    case "CANCELLED":
      return {
        label: "Annulée",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: FaTimes,
        description: "La commande a été annulée"
      };
    case "REFUNDED":
      return {
        label: "Remboursée",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaUndo,
        description: "La commande a été remboursée"
      };
    default:
      return {
        label: status,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: FaClock,
        description: "Statut de commande"
      };
  }
};

const OrderDetailsAdmin: React.FC<OrderDetailsAdminProps> = ({ order }) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [updateMessage, setUpdateMessage] = useState("");
  const [newDeliveryTime, setNewDeliveryTime] = useState(order.deliveryZone?.deliveryTime || "");
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [deliveryUpdateMessage, setDeliveryUpdateMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUpdateMessage("Statut mis à jour avec succès !");
        // Recharger la page pour voir les changements
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        const error = await response.json();
        setUpdateMessage(`Erreur: ${error.error}`);
      }
    } catch (error) {
      setUpdateMessage("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeliveryTimeUpdate = async () => {
    if (newDeliveryTime === order.deliveryZone?.deliveryTime) return;

    setIsUpdatingDelivery(true);
    setDeliveryUpdateMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
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
        // Recharger la page pour voir les changements
        setTimeout(() => {
          router.refresh();
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
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
    router.push('/admin/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/admin/orders")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-3 sm:mb-4 font-bold text-base sm:text-lg"
          >
            <FaArrowLeft />
            Retour aux commandes
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-800">
                Commande #{order.orderNumber}
              </h1>
              <p className="text-orange-400 mt-1 text-sm sm:text-base">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center text-right gap-2 sm:gap-3 mt-2 sm:mt-0">
              <button
                onClick={handleShareOrder}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
              >
                {copied ? <FaCopy /> : <FaShare />}
                {copied ? "Lien copié !" : "Partager le reçu"}
              </button>
              <div className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 transition-colors font-bold w-full sm:w-auto justify-center"
                title="Supprimer la commande"
              >
                <Trash2 className="w-4 h-4 mr-2 text-orange-200" /> Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Update Status Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4">Gestion du statut</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 w-full sm:w-auto"
            >
              <option value="PENDING_PAYMENT">En attente de vérification</option>
              <option value="PAYMENT_VERIFIED">Paiement vérifié</option>
              <option value="PROCESSING">En cours de traitement</option>
              <option value="SHIPPED">Expédiée</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
              <option value="REFUNDED">Remboursée</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === order.status}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold w-full sm:w-auto"
            >
              {isUpdating ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
          {updateMessage && (
            <p className={`mt-2 text-sm ${updateMessage.includes("Erreur") ? "text-red-600" : "text-green-600"}`}>
              {updateMessage}
            </p>
          )}
        </div>

        {/* Update Delivery Time Section */}
        {order.deliveryZone && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4">Modifier le délai de livraison</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <input
                type="text"
                value={newDeliveryTime}
                onChange={(e) => setNewDeliveryTime(e.target.value)}
                placeholder="Ex: 30-45 minutes"
                className="px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300 flex-1 w-full sm:w-auto"
              />
              <button
                onClick={handleDeliveryTimeUpdate}
                disabled={isUpdatingDelivery || newDeliveryTime === order.deliveryZone?.deliveryTime}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold w-full sm:w-auto"
              >
                {isUpdatingDelivery ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
            {deliveryUpdateMessage && (
              <p className={`mt-2 text-sm ${deliveryUpdateMessage.includes("Erreur") ? "text-red-600" : "text-green-600"}`}>
                {deliveryUpdateMessage}
              </p>
            )}
            <p className="text-sm text-orange-400 mt-2">
              Délai actuel : <span className="font-medium">{order.deliveryZone?.deliveryTime}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Liste des produits */}
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2 text-orange-700">Produits commandés</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-orange-100 text-orange-800">
                      <th className="px-4 py-2 border">Produit</th>
                      <th className="px-4 py-2 border">Fournisseur</th>
                      <th className="px-4 py-2 border">Prix fournisseur</th>
                      <th className="px-4 py-2 border">Quantité</th>
                      <th className="px-4 py-2 border">Prix unitaire</th>
                      <th className="px-4 py-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-orange-50 transition">
                        <td className="border px-4 py-2">
                          <div className="flex items-center gap-2">
                            {item.product.imageUrl && (
                              <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <span>{item.product.name}</span>
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-gray-700">
                          {item.product.supplier ? (
                            <span>{item.product.supplier.name} <span className="text-xs text-gray-400">({item.product.supplier.email})</span></span>
                          ) : (
                            <span className="text-gray-400 italic">Aucun</span>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-gray-700">
                          {item.product.supplierPrice ? formatCurrency(Number(item.product.supplierPrice)) : <span className="text-gray-400 italic">-</span>}
                        </td>
                        <td className="border px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border px-4 py-2">{formatCurrency(item.price)}</td>
                        <td className="border px-4 py-2">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            {order.paymentInfo && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-green-600" />
                  Informations de paiement
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <FaPhone className="text-green-600" />
                    <span className="font-medium">Numéro de paiement :</span>
                    <span>{order.paymentInfo.clientPhone}</span>
                  </div>
                  {order.paymentInfo.receiptImage && (
                    <div>
                      <p className="text-xs sm:text-sm text-orange-400 mb-2">Reçu de paiement :</p>
                      <img
                        src={order.paymentInfo.receiptImage}
                        alt="Reçu de paiement"
                        className="max-w-full sm:max-w-md rounded border border-orange-100"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FaUser className="text-orange-500" />
                Informations client
              </h2>
              <div className="space-y-1 sm:space-y-2">
                <p className="font-bold text-orange-900 text-sm sm:text-base">
                  {order.user.firstName} {order.user.lastName}
                </p>
                <p className="text-orange-400 text-xs sm:text-sm">{order.user.email}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4">Résumé de la commande</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-orange-400">Sous-total</span>
                  <span className="font-bold text-orange-900">
                    {formatCurrency(order.total - (order.deliveryZone?.deliveryFee || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-orange-400">Livraison</span>
                  <span className="font-bold text-orange-900">
                    {formatCurrency(order.deliveryZone?.deliveryFee || 0)}
                  </span>
                </div>
                <div className="border-t border-orange-100 pt-2 sm:pt-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-bold text-orange-800">Total</span>
                    <span className="font-bold text-lg text-orange-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-orange-500" />
                  Adresse de livraison
                </h2>
                <div className="text-orange-400 text-xs sm:text-sm">
                  <p className="font-bold text-orange-900 text-sm sm:text-base">
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
                    <div className="mt-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-bold text-orange-800 mb-1">Coordonnées GPS :</p>
                      <p className="text-xs sm:text-sm text-orange-700 font-mono mb-2">
                        {formatGPS(order.shippingAddress.latitude, order.shippingAddress.longitude)}
                      </p>
                      <a
                        href={getGoogleMapsLink(order.shippingAddress.latitude, order.shippingAddress.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors"
                      >
                        <FaMapMarkerAlt />
                        Ouvrir dans Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Zone */}
            {order.deliveryZone && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4">Zone de livraison</h2>
                <div className="text-orange-400 text-xs sm:text-sm">
                  <p className="font-bold text-orange-900 text-sm sm:text-base">{order.deliveryZone.name}</p>
                  <p className="text-xs sm:text-sm">{order.deliveryZone.description}</p>
                  <p className="text-xs sm:text-sm mt-2">
                    <span className="font-bold text-orange-800">Délai de livraison :</span> {order.deliveryZone.deliveryTime}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-8 max-w-sm w-full mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4">Confirmer la suppression</h2>
              <p className="text-orange-700 mb-4 sm:mb-6 text-xs sm:text-sm">Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.</p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors w-full sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 font-bold w-full sm:w-auto"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsAdmin; 