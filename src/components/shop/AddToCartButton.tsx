"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { FaShoppingCart, FaCheck } from "react-icons/fa";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
  className?: string;
}

export default function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  stock,
  className = ""
}: AddToCartButtonProps) {
  const { data: session } = useSession();
  const { addToCart, isLoading, error } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (stock === 0) return;

    try {
      await addToCart(
        {
          productId,
          name,
          price,
          imageUrl,
          stock
        },
        quantity
      );

      // Afficher le message de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      // console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(newQuantity, stock)));
  };

  if (stock === 0) {
    return (
      <Button 
        disabled 
        className={`w-full ${className}`}
      >
        Rupture de stock
      </Button>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Sélecteur de quantité */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || isLoading}
          className="w-8 h-8 rounded bg-gray-100 text-lg font-bold hover:bg-gray-200 disabled:opacity-50"
        >
          –
        </button>
        <span className="w-12 text-center font-semibold">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= stock || isLoading}
          className="w-8 h-8 rounded bg-gray-100 text-lg font-bold hover:bg-gray-200 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Bouton d'ajout au panier */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Ajout en cours...
          </>
        ) : showSuccess ? (
          <>
            <FaCheck />
            Ajouté au panier !
          </>
        ) : (
          <>
            <FaShoppingCart />
            Ajouter au panier
          </>
        )}
      </Button>

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {/* Message pour utilisateurs non connectés */}
      {!session && (
        <p className="text-blue-600 text-sm text-center">
          Connectez-vous pour sauvegarder votre panier
        </p>
      )}

      {/* Stock disponible */}
      <p className="text-gray-500 text-sm text-center">
        {stock > 0 ? `${stock} en stock` : "Rupture de stock"}
      </p>
    </div>
  );
} 