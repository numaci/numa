"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatGPS, getGoogleMapsLink, generateOrderShareLink } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Order, OrderStatus } from "@/types/order-types";

interface OrderDetailsAdminProps {
  order: Order;
}

const OrderDetailsAdmin: React.FC<OrderDetailsAdminProps> = ({ order }) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [updateMessage, setUpdateMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper variables for type-guarded data
  const shippingAddress = order.shippingAddress.isParsed ? order.shippingAddress.data : null;
  const paymentInfo = order.paymentInfo.isParsed ? order.paymentInfo.data : null;
  const deliveryZone = order.deliveryZone.isParsed ? order.deliveryZone.data : null;

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUpdateMessage("Statut mis à jour avec succès !");
        setTimeout(() => router.refresh(), 1000);
      } else {
        const error = await response.json();
        setUpdateMessage(`Erreur: ${error.error}`);
      }
    } catch (error) {
      setUpdateMessage("Erreur lors de la mise à jour du statut.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareOrder = async () => {
    try {
      // Type guard for shippingAddress
      if (order.shippingAddress && !('raw' in order.shippingAddress)) {
        const shareLink = generateOrderShareLink(
          order.orderNumber.toString(),
          order.orderItems,
          order.shippingAddress
        );
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Handle the case where shipping address is not available or raw
        console.error('Cannot generate share link without a valid shipping address.');
      }
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
      router.push('/admin/orders');
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section de mise à jour du statut */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mettre à jour le statut</h3>
        <div className="flex items-center gap-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="admin-input w-full md:w-1/3"
          >
            <option value="PENDING">En attente</option>
            <option value="PROCESSING">En préparation</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELLED">Annulée</option>
            <option value="REFUNDED">Remboursée</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || newStatus === order.status}
            className="admin-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Mise à jour..." : "Enregistrer"}
          </button>
        </div>
        {updateMessage && (
          <p className={`mt-3 text-sm ${updateMessage.includes("Erreur") ? "text-red-600" : "text-green-600"}`}>
            {updateMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails des produits */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Produits commandés</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={item.product.imageUrl || '/placeholder.png'} alt={item.product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informations de paiement */}
          {order.paymentInfo && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de paiement</h3>
              {paymentInfo ? (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Numéro de téléphone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentInfo.clientPhone || 'Non fourni'}</dd>
                  </div>
                  {paymentInfo.receiptImage && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Reçu de paiement</dt>
                      <dd className="mt-1">
                        <img
                          src={paymentInfo.receiptImage}
                          alt="Reçu de paiement"
                          className="max-w-xs rounded-lg border border-gray-200"
                        />
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Données brutes</dt>
                  <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{order.paymentInfo.raw}</dd>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne latérale (1/3) */}
        <div className="space-y-6">
          {/* Résumé de la commande */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.total - (deliveryZone?.deliveryFee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span className="font-medium text-gray-900">{formatCurrency(deliveryZone?.deliveryFee || 0)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Client</h3>
            <div>
              <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              <p className="text-sm text-gray-500">{shippingAddress?.phone || 'Pas de téléphone'}</p>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adresse de livraison</h3>
            <address className="not-italic text-sm text-gray-500 space-y-1">
              {shippingAddress ? (
                <>
                  <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  {shippingAddress.gps && (
                    <a
                      href={getGoogleMapsLink(shippingAddress.gps.lat, shippingAddress.gps.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 pt-2"
                    >
                      Voir sur Google Maps
                    </a>
                  )}
                </>
              ) : (
                <p>{order.shippingAddress?.raw}</p>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* Actions de la commande */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
         <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
         <div className="flex items-center gap-4">
            <button
              onClick={handleShareOrder}
              className="admin-button-secondary"
            >
              {copied ? "Lien copié !" : "Partager le reçu"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="admin-button-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer la commande
            </button>
         </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
            <p className="my-4 text-sm text-gray-600">Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="admin-button-secondary">Annuler</button>
              <button onClick={handleDelete} className="admin-button-destructive">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsAdmin; 