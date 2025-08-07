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
    <div className={bestMode ? 
      "relative bg-white overflow-hidden max-w-xs w-full mx-auto group border border-gray-100 hover:border-gray-300 transition-all duration-300 h-48 sm:h-64 lg:h-72 p-0" : 
      "bg-white p-4 flex flex-col items-stretch max-w-xs w-full mx-auto group relative border border-gray-100 hover:border-gray-300 transition-all duration-300"}>
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
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <span className="text-gray-300 text-3xl">📦</span>
              </div>
            )}
            {/* Overlay infos */}
            <div className="absolute bottom-0 left-0 w-full bg-white/90 px-4 py-3 flex flex-col items-center">
              <span className="font-medium tracking-tight text-sm sm:text-base lg:text-lg truncate block w-full text-center text-black group-hover:text-gray-700 transition-all duration-300 mb-1">{product.name}</span>
              <span className="font-semibold text-lg sm:text-xl lg:text-2xl text-black truncate text-center">{formatCurrency(product.price)}</span>
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
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-300 text-3xl">📦</span>
                </div>
              )}
              {/* Badge de réduction */}
              {discountPercentage > 0 && !bestMode && (
                <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 font-medium">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          </Link>
        </div>
      )}
      {/* Infos produit */}
      {bestMode ? null : (
        <div className={bestMode ? "h-1/2 flex flex-col px-0.5 pt-0 pb-0" : "flex-1 flex flex-col px-1 pt-4 pb-1"}>
          <Link href={`/products/${product.slug}`}> 
            <span className={bestMode ? "font-medium tracking-tight text-sm sm:text-lg lg:text-xl truncate block w-full text-center text-black group-hover:text-gray-700 transition-all duration-300 mb-1" : "font-medium tracking-tight text-base truncate block w-full text-black group-hover:text-gray-700 transition-all duration-300 mb-2"}>{product.name}</span>
          </Link>
          {/* Description sur 2 lignes max (sauf bestMode) */}
          {!bestMode && product.description && (
            <span className="text-sm text-gray-500 line-clamp-2 mb-3 block min-h-[40px]">{product.description || "Confort et élégance intemporelle."}</span>
          )}
          <div className={bestMode ? "flex flex-col items-center mb-0" : "flex flex-col items-start mb-3"}>
            <span className={bestMode ? "font-semibold text-lg sm:text-xl lg:text-2xl text-black truncate text-center" : "font-medium text-lg text-black truncate"}>{formatCurrency(product.price)}</span>
            {/* Prix barré sous le prix principal, sauf bestMode */}
            {!bestMode && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through truncate mt-1">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>
          {/* Bouton ajouter au panier */}
          {!hideCartActions && (
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isLoading}
              className={bestMode
                ? "mt-auto mb-1 bg-black hover:bg-gray-900 text-white w-11/12 mx-auto py-1 h-8 text-xs font-medium tracking-tight flex items-center justify-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                : "mt-auto bg-black hover:bg-gray-900 text-white w-full py-2 font-medium tracking-tight flex items-center justify-center gap-2 text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"}
              size={bestMode ? undefined : "sm"}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Commande en cours...
                </>
              ) : showSuccess ? (
                <>
                  <FaCheck size={16} />
                  Commandé !
                </>
              ) : product.stock > 0 ? (
                bestMode ? (
                  <FaShoppingCart size={16} />
                ) : (
                  <>
                    <FaShoppingCart size={16} />
                    Commander maintenant
                  </>
                )
              ) : (
                "Indisponible"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}