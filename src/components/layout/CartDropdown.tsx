"use client";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

interface CartDropdownProps {
  open: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 500;
const CURRENCY = 'XOF';

function formatFCFA(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: CURRENCY }).replace("F", "FCFA");
}

export default function CartDropdown({ open, onClose }: CartDropdownProps) {
  const { data: session } = useSession();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    isLoading, 
    isAuthenticated,
    loadCartFromDatabase
  } = useCart();
  
  const total = getTotalPrice();
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Recharger le panier quand il s'ouvre (pour les utilisateurs connectés)
  useEffect(() => {
    if (open && isAuthenticated) {
      loadCartFromDatabase();
    }
  }, [open, isAuthenticated, loadCartFromDatabase]);

  // Debug: afficher les changements du panier
  useEffect(() => {
    if (open) {
      // console.log("CartDropdown: Items changed", items);
      // console.log("CartDropdown: Total price", total);
      // console.log("CartDropdown: Is authenticated", isAuthenticated);
      // console.log("CartDropdown: Is loading", isLoading);
    }
  }, [items, total, open, isAuthenticated, isLoading]);

  if (!open) return null;

  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(1, total / FREE_SHIPPING_THRESHOLD);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      {/* Drawer */}
      <div
        ref={ref}
        className="relative w-full max-w-md h-full bg-white/90 text-gray-900 shadow-2xl rounded-l-2xl flex flex-col animate-slide-in-right pb-24"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-amber-600">Mon panier</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-amber-100 hover:text-amber-600 text-2xl transition-colors">×</button>
        </div>

        {/* État de connexion */}
        {!isAuthenticated && (
          <div className="px-6 py-3 bg-blue-50 border-b">
            <p className="text-sm text-blue-700">
              <Link href="/login" className="underline font-medium">Connectez-vous</Link> pour sauvegarder votre panier
            </p>
          </div>
        )}

        {/* Free shipping progress */}
        <div className="px-6 pt-4">
          {missing > 0 ? (
            <div className="text-sm mb-2">
              Il vous manque <span className="font-bold">{formatFCFA(missing)}</span> pour avoir la <span className="font-bold">livraison gratuite</span>.
            </div>
          ) : (
            <div className="text-sm text-green-600 mb-2 font-bold">Vous avez la livraison gratuite !</div>
          )}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-2 bg-orange-400 rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement du panier...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p>Votre panier est vide.</p>
              {!isAuthenticated && (
                <p className="text-sm mt-2">
                  <Link href="/login" className="text-amber-600 underline">Connectez-vous</Link> pour voir vos articles sauvegardés
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 border-b pb-4">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-xl shadow border border-amber-100 object-cover transition-transform duration-200 hover:scale-105" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-xl shadow border border-amber-100">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold">{formatFCFA(item.price)}</span>
                    </div>
                    {/* Quantity selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="w-7 h-7 rounded-full bg-gray-100 text-lg font-bold hover:bg-amber-100 focus:ring-2 focus:ring-amber-400 transition-all disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        –
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        className="w-7 h-7 rounded-full bg-gray-100 text-lg font-bold hover:bg-amber-100 focus:ring-2 focus:ring-amber-400 transition-all disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                        disabled={item.quantity >= item.stock || isLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 text-2xl ml-2 transition-colors disabled:opacity-50"
                    title="Supprimer"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subtotal & actions sticky en bas */}
        <div className="p-6 border-t bg-white/95 sticky bottom-0 z-10">
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Sous-total :</span>
            <span className="text-amber-600">{formatFCFA(total)}</span>
          </div>
          {/* Boutons d'action principaux */}
          <div className="flex gap-3 mt-2">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200">
                Passer à la caisse
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex-1 w-full rounded-full border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold text-base transition-all duration-200"
              onClick={onClose}
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 