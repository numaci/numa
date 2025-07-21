"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { decodeShareData, formatGPS, getGoogleMapsLink } from "@/lib/utils";
import { FaMapMarkerAlt, FaPhone, FaClipboardList, FaShare, FaCopy } from "react-icons/fa";

interface SharedOrderData {
  orderNumber: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
}

export default function SharedOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<SharedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    
    if (!encodedData) {
      setError("Données de partage manquantes");
      setLoading(false);
      return;
    }

    try {
      const decodedData = decodeShareData(encodedData);
      if (decodedData) {
        setOrderData(decodedData);
      } else {
        setError("Données de partage invalides");
      }
    } catch (err) {
      setError("Erreur lors du décodage des données");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // console.error('Erreur lors de la copie:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <FaClipboardList className="text-4xl text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Erreur</h3>
          <p className="text-red-600">{error || "Données non trouvées"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Receipt Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">RECU DE COMMANDE</h1>
            <p className="text-blue-100">E-commerce Sikasso</p>
            <div className="mt-4">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                {copied ? <FaCopy /> : <FaShare />}
                {copied ? "Lien copié !" : "Partager ce reçu"}
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            {/* Order Info */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Commande #{orderData.orderNumber}</h2>
                  <p className="text-gray-600 text-sm">
                    {new Date(orderData.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Commande confirmée
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                Informations client
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">
                  {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{orderData.shippingAddress.address1}</p>
                {orderData.shippingAddress.address2 && (
                  <p className="text-gray-600">{orderData.shippingAddress.address2}</p>
                )}
                <p className="text-gray-600">{orderData.shippingAddress.city}</p>
                {orderData.shippingAddress.phone && (
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <FaPhone className="text-blue-600" />
                    {orderData.shippingAddress.phone}
                  </p>
                )}
                {orderData.shippingAddress.latitude && orderData.shippingAddress.longitude && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Coordonnées GPS :</p>
                    <p className="text-sm text-blue-700 font-mono mb-2">
                      {formatGPS(orderData.shippingAddress.latitude, orderData.shippingAddress.longitude)}
                    </p>
                    <a
                      href={getGoogleMapsLink(orderData.shippingAddress.latitude, orderData.shippingAddress.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      <FaMapMarkerAlt />
                      Ouvrir dans Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaClipboardList className="text-blue-600" />
                Articles commandés
              </h3>
              <div className="space-y-3">
                {orderData.products.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">✓ Inclus</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center text-gray-600 text-sm">
                <p className="mb-2">Merci pour votre commande !</p>
                <p>Ce reçu a été généré automatiquement</p>
                <p className="mt-2 text-xs text-gray-400">
                  Les prix et informations de paiement ne sont pas inclus dans ce reçu partagé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 