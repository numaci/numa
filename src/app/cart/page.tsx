"use client";
export const dynamic = 'force-dynamic';

import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

const CURRENCY = 'XOF';
const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 1500;
function formatFCFA(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: CURRENCY }).replace("F", "FCFA");
}

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  
  const {
    items,
    isLoading,
    error,
    removeFromCart,
    updateQuantity,
    updateVariant,
    clearCart,
    totalPrice,
  } = useCart();
  
  const subtotal = totalPrice;
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const savings = items.reduce((sum, item) => {
    // Si comparePrice existe et > price, on compte l'économie
    return sum + ((item as any).comparePrice && (item as any).comparePrice > item.price
      ? ((item as any).comparePrice - item.price) * item.quantity
      : 0);
  }, 0);

  if (!isClient) return null;

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Tableau produits */}
      <div className="md:col-span-2">
        <h1 className="text-2xl font-light text-gray-800 mb-8">Mon panier</h1>
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-16 border border-gray-100 bg-white">
            Votre panier est vide.<br />
            <Link href="/products" className="text-gray-800 hover:underline">Voir les produits</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.productId} className="align-top hover:bg-gray-50 transition-colors">
                    {/* Produit */}
                    <td className="px-6 py-4 flex items-center gap-4 min-w-[260px]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 border border-gray-100 object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center border border-gray-100">📦</div>
                      )}
                      <div>
                        <div className="font-medium text-base line-clamp-1">{item.name}</div>
                        {/* Détails optionnels (ex: couleur, modèle) */}
                        {(item as any).color && (
                          <div className="text-xs text-gray-500">Couleur : {(item as any).color}</div>
                        )}
                        {(item as any).model && (
                          <div className="text-xs text-gray-500">Modèle : {(item as any).model}</div>
                        )}
                        {/* Sélecteur de taille/variant si disponible */}
                        {Array.isArray((item as any).availableVariants) && (item as any).availableVariants.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-xs text-gray-500">
                              {(item as any).variantName || 'Taille'}:
                            </label>
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                              value={(item as any).variantId || ''}
                              onChange={(e) => updateVariant(item.productId, e.target.value)}
                            >
                              {(item as any).availableVariants.map((v: any) => (
                                <option key={v.id} value={v.id} disabled={v.stock === 0}>
                                  {v.value}{v.stock === 0 ? ' — indisponible' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {/* Badge promo */}
                        {(item as any).comparePrice && (item as any).comparePrice > item.price && (
                          <span className="inline-block bg-black text-white text-xs px-2 py-0.5 mt-1">-
                            {Math.round(((item as any).comparePrice - item.price) / (item as any).comparePrice * 100)}%
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Prix */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="font-medium text-base">{formatFCFA(item.price)}</div>
                      {(item as any).comparePrice && (item as any).comparePrice > item.price && (
                        <div className="text-xs text-gray-400 line-through">{formatFCFA((item as any).comparePrice)}</div>
                      )}
                    </td>
                    {/* Quantité */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="w-7 h-7 border border-gray-200 text-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          –
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          className="w-7 h-7 border border-gray-200 text-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                          onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    {/* Total par article */}
                    <td className="px-6 py-4 text-center font-medium text-base">
                      {formatFCFA(item.price * item.quantity)}
                    </td>
                    {/* Supprimer */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-lg transition-colors"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 px-6 pb-4">
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Récapitulatif à droite */}
      <div className="bg-white border border-gray-100 p-8 space-y-4 h-fit flex flex-col justify-between">
        <h2 className="text-xl font-light mb-6 text-gray-800 pb-2 border-b border-gray-100">Récapitulatif</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Sous-total ({items.reduce((sum, i) => sum + i.quantity, 0)} articles)</span>
          <span className="font-medium text-gray-800">{formatFCFA(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Économies</span>
            <span className="text-black">- {formatFCFA(savings)}</span>
          </div>
        )}
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Livraison</span>
          <span className="font-medium text-gray-800">{shipping === 0 ? "Gratuite" : formatFCFA(shipping)}</span>
        </div>
        <hr className="my-4 border-gray-100" />
        <div className="flex justify-between items-center text-lg font-medium mb-6">
          <span>Total estimé</span>
          <span className="text-black text-xl">{formatFCFA(total)}</span>
        </div>
        <Link href="/checkout">
          <Button className="w-full bg-black hover:bg-gray-900 text-white font-medium text-base py-3 transition-all duration-200">
            Passer à la caisse
          </Button>
        </Link>
        <div className="text-center text-xs text-gray-500 mt-4">
          <span>Créer un <Link href="/register" className="underline text-gray-800">compte</Link> et gagnez des bonus sur vos achats !</span>
        </div>
      </div>
    </div>
  );
}