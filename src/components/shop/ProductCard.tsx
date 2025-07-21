"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { Notification } from "@/components/ui/Notification";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

// Interface pour les données d'un produit
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  isActive: boolean;
  stock: number;
  isFeatured?: boolean;
  description?: string; // Ajout de la description
}

// Interface pour les props du composant ProductCard
interface ProductCardProps {
  product: Product;
  hideCartActions?: boolean;
  smallCard?: boolean;
  bestMode?: boolean; // Ajouté pour mode 'meilleures produits'
}

// Composant ProductCard pour afficher un produit dans une grille
// Inclut l'image, le nom, le prix et le bouton d'ajout au panier
export default function ProductCard({ product, hideCartActions, smallCard, bestMode }: ProductCardProps) {
  const { data: session } = useSession();
  const { addToCart, isLoading, error } = useCart();
  const { openCart } = useCartDrawer();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Gestion de l'ajout au panier
  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    try {
      await addToCart(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
        },
        quantity
      );
      
      // Afficher le message de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setQuantity(1);
      openCart();
    } catch (error) {
      // console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  // Calcul du pourcentage de réduction
  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className={bestMode ? "relative bg-white rounded-xl shadow overflow-hidden max-w-xs w-full mx-auto group border border-gray-100 hover:border-amber-400 transition-all h-48 sm:h-64 lg:h-72 p-0" : "bg-white rounded-xl shadow p-2 flex flex-col items-stretch max-w-xs w-full mx-auto group relative border border-gray-100 hover:border-amber-400 transition-all"}>
      {/* Image du produit en mode bestMode: prend toute la carte */}
      {bestMode ? (
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <div className="relative w-full h-full aspect-square flex items-end justify-center overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📦</span>
              </div>
            )}
            {/* Overlay infos */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white/95 via-white/80 to-transparent px-2 py-2 flex flex-col items-center">
              <span className="font-semibold text-sm sm:text-base lg:text-lg truncate block w-full text-center text-amber-700 group-hover:text-amber-900 transition-colors mb-0.5">{product.name}</span>
              <span className="font-bold text-lg sm:text-xl lg:text-2xl text-blue-900 truncate text-center">{formatCurrency(product.price)}</span>
            </div>
          </div>
        </Link>
      ) : (
        // Image du produit
        <div className={bestMode ? "h-1/2 w-full flex items-center justify-center" : ""}>
          <Link href={`/products/${product.slug}`} className="block relative w-full h-full">
            <div className={bestMode ? "relative w-full h-full flex items-center justify-center overflow-hidden" : "relative w-full aspect-square flex items-center justify-center overflow-hidden"}>
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">📦</span>
                </div>
              )}
              {/* Badge de réduction */}
              {discountPercentage > 0 && !bestMode && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold shadow">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          </Link>
        </div>
      )}
      {/* Infos produit */}
      {bestMode ? null : (
        <div className={bestMode ? "h-1/2 flex flex-col px-0.5 pt-0 pb-0" : "flex-1 flex flex-col px-1 pt-2 pb-1"}>
          <Link href={`/products/${product.slug}`}> 
            <span className={bestMode ? "font-semibold text-sm sm:text-lg lg:text-xl truncate block w-full text-center text-gray-900 group-hover:text-amber-600 transition-colors mb-0.5" : "font-semibold text-sm truncate block w-full text-gray-900 group-hover:text-amber-600 transition-colors mb-1"}>{product.name}</span>
          </Link>
          {/* Description sur 2 lignes max (sauf bestMode) */}
          {!bestMode && product.description && (
            <span className="text-xs text-gray-500 line-clamp-2 mb-1 block min-h-[32px]">{product.description}</span>
          )}
          <div className={bestMode ? "flex flex-col items-center mb-0" : "flex flex-col items-start mb-1"}>
            <span className={bestMode ? "font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 truncate text-center" : "font-bold text-lg text-gray-900 truncate"}>{formatCurrency(product.price)}</span>
            {/* Prix barré sous le prix principal, sauf bestMode */}
            {!bestMode && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through truncate mt-0.5">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>
          {/* Bouton ajouter au panier */}
          {!hideCartActions && (
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isLoading}
              className={bestMode
                ? "mt-auto mb-1 bg-orange-500 hover:bg-orange-600 text-white rounded w-11/12 mx-auto py-1 h-7 text-xs font-semibold flex items-center justify-center gap-1 shadow disabled:opacity-60 disabled:cursor-not-allowed"
                : "mt-2 bg-orange-500 hover:bg-orange-600 text-white rounded w-full py-2 font-semibold flex items-center justify-center gap-2 text-sm shadow disabled:opacity-60 disabled:cursor-not-allowed"
              }
              size={bestMode ? undefined : "sm"}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout en cours...
                </>
              ) : showSuccess ? (
                <>
                  <FaCheck />
                  Ajouté !
                </>
              ) : product.stock > 0 ? (
                bestMode ? (
                  <FaShoppingCart />
                ) : (
                  <>
                    <FaShoppingCart />
                    Ajouter au panier
                  </>
                )
              ) : (
                "Rupture de stock"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 