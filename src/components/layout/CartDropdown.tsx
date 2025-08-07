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
  const isAuthenticated = session !== null;
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    totalPrice,
    isLoading
  } = useCart();
  
  const total = totalPrice;
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
  // useEffect(() => {
  //   if (open && isAuthenticated) {
  //     loadCartFromDatabase();
  //   }
  // }, [open, isAuthenticated, loadCartFromDatabase]);

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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      {/* Drawer */}
      <div
        ref={ref}
        className="relative w-full max-w-md h-full bg-white text-black shadow-lg flex flex-col animate-slide-in-right pb-24 border-l border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <h2 className="text-2xl font-semibold tracking-tight">Votre sélection NUMA</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-black text-2xl transition-all duration-300">×</button>
        </div>

        {/* État de connexion */}
        {!isAuthenticated && (
          <div className="px-8 py-4 bg-gray-100 border-b border-gray-100">
            <p className="text-sm text-gray-700">
              
            </p>
          </div>
        )}

        {/* Free shipping progress */}
        <div className="px-8 pt-6">
          {missing > 0 ? (
            <div className="text-sm mb-3">
              Il vous manque <span className="font-semibold">{formatFCFA(missing)}</span> pour avoir la <span className="font-semibold">livraison gratuite</span>.
            </div>
          ) : (
            <div className="text-sm text-black mb-3 font-semibold">Vous avez la livraison gratuite !</div>
          )}
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-1 bg-black rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-8">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-400 mt-4 tracking-wide">Chargement du panier...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p className="tracking-wide">Votre panier est vide.</p>
              {!isAuthenticated && (
                <p className="text-sm mt-4">
              
            </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-6 border-b border-gray-100 pb-6 mb-6">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-20 h-20 object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium tracking-tight truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-semibold">{formatFCFA(item.price)}</span>
                    </div>
                    {/* Quantity selector */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 text-lg font-medium hover:bg-black hover:text-white focus:outline-none transition-all duration-300 disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        –
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 text-lg font-medium hover:bg-black hover:text-white focus:outline-none transition-all duration-300 disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                        disabled={item.quantity >= item.stock || isLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-black text-xl ml-2 transition-all duration-300 disabled:opacity-50"
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
        <div className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <div className="flex justify-between items-center text-lg font-semibold mb-6">
            <span>Sous-total :</span>
            <span className="text-black">{formatFCFA(total)}</span>
          </div>
          {/* Boutons d'action principaux */}
          <div className="flex gap-4 mt-4">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full py-3 bg-black hover:bg-gray-900 text-white font-medium tracking-wide transition-all duration-300">
                Passer à la caisse
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex-1 w-full py-3 border-gray-300 text-black hover:bg-gray-100 font-medium tracking-wide transition-all duration-300"
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