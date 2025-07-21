"use client";

import { useCart } from "@/hooks/useCart";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import Image from "next/image";

interface DeliveryZone {
  name: string;
  center: [number, number];
  deliveryTime: string;
  deliveryFee: number;
  description: string;
}

interface CheckoutSummaryProps {
  selectedZone?: DeliveryZone | null;
  currentStep?: number;
}

const CURRENCY = 'XOF';

function formatFCFA(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: CURRENCY }).replace("F", "FCFA");
}

export default function CheckoutSummary({ selectedZone, currentStep }: CheckoutSummaryProps) {
  const { items } = useCart();
  const { config, loading } = useShippingConfig();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Utiliser la config dynamique si chargée, sinon fallback
  const SHIPPING_THRESHOLD = config?.freeThreshold ?? 10000;
  const DEFAULT_SHIPPING = config?.fee ?? 500;

  let shipping = 0;
  if (selectedZone) {
    shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  } else {
    shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  }
  const total = subtotal + shipping;

  // N'affiche le récapitulatif que si on est à l'étape 2 ou plus
  if (currentStep && currentStep < 2) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Récapitulatif de la commande</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-50 rounded-md overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/placeholder.png"
                    alt="Image par défaut"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate text-amber-900">{item.name}</p>
                <p className="text-sm text-amber-600">Quantité: {item.quantity}</p>
                <p className="text-sm text-amber-700">{formatFCFA(item.price)}</p>
              </div>
            </div>
            <p className="font-medium text-sm">{formatFCFA(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Informations de livraison */}
      {selectedZone && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <h4 className="font-medium text-amber-900">{selectedZone.name}</h4>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p><strong>Temps de livraison:</strong> {selectedZone.deliveryTime}</p>
            <p><strong>Frais de livraison:</strong> {formatFCFA(selectedZone.deliveryFee)}</p>
            <p className="text-xs">{selectedZone.description}</p>
          </div>
        </div>
      )}

      <div className="border-t pt-4 mt-6 space-y-2">
        <div className="flex justify-between">
          <span>Sous-total ({items.reduce((sum, i) => sum + i.quantity, 0)} articles)</span>
          <span>{formatFCFA(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>{shipping === 0 ? "Gratuite" : formatFCFA(shipping)}</span>
        </div>
        <div className="text-xs text-amber-700 mt-1">
          Livraison gratuite à Sikasso dès {SHIPPING_THRESHOLD.toLocaleString('fr-FR')} FCFA d’achat, sinon {formatFCFA(DEFAULT_SHIPPING)}.
        </div>
        
        {shipping > 0 && selectedZone && (
          <div className="text-sm text-amber-600">
            Il vous manque {formatFCFA(SHIPPING_THRESHOLD - subtotal)} pour la livraison gratuite
          </div>
        )}
        
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total</span>
          <span>{formatFCFA(total)}</span>
        </div>
      </div>

      {/* Message d'information si aucune zone n'est sélectionnée */}
      {!selectedZone && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Sélectionnez votre adresse sur la carte pour voir les frais de livraison exacts.
          </p>
        </div>
      )}
    </div>
  );
} 