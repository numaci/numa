"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  images?: string; // JSON array of additional image URLs
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Build image list: primary image + extra images
  let extraImages: string[] = [];
  try {
    const parsed = product.images ? JSON.parse(product.images) : [];
    if (Array.isArray(parsed)) {
      extraImages = parsed.filter((url) => typeof url === 'string' && url.length > 0);
    }
  } catch {}
  const allImages = [product.imageUrl, ...extraImages].filter(Boolean) as string[];

  // Gestion de l'ajout au panier
  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    try {
      const variants: any[] = (product as any).variants || [];
      const hasVariants = Array.isArray(variants) && variants.length > 0;
      await addToCart(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          // Provide variant metadata if available so user can choose size in cart
          ...(hasVariants
            ? {
                variantName: variants[0]?.name || "Taille",
                availableVariants: variants.map((v) => ({
                  id: String(v.id),
                  value: v.value,
                  name: v.name,
                  price: Number(v.price ?? product.price),
                  stock: Number(v.stock ?? product.stock),
                })),
              }
            : {}),
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
      "relative overflow-hidden w-full group p-0" : 
      "p-0 flex flex-col items-stretch w-full group relative"}>
      {/* Zone image avec carrousel horizontal si plusieurs images */}
      <div className={bestMode ? "w-full" : ""}>
        <Link href={`/products/${product.slug}`} prefetch={true} className="block relative w-full">
          {/* Wrapper fixe pour l'overlay */}
          <div className="relative w-full aspect-square">
            {/* Scroller qui bouge en dessous */}
            <div
              ref={scrollerRef}
              className={
                (bestMode
                  ? "absolute inset-0 overflow-x-auto scrollbar-hide flex snap-x snap-mandatory min-h-[9.5rem]"
                  : "absolute inset-0 overflow-x-auto scrollbar-hide flex snap-x snap-mandatory")
              }
              onScroll={(e) => {
                const el = e.currentTarget;
                const idx = Math.round(el.scrollLeft / el.clientWidth);
                if (idx !== currentIdx) setCurrentIdx(idx);
              }}
            >
              {allImages.length > 0 ? (
                allImages.map((src, i) => (
                  <div key={i} className="relative min-w-full h-full snap-center">
                    <Image
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))
              ) : (
                <div className="relative min-w-full h-full bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-300 text-3xl">📦</span>
                </div>
              )}
              {discountPercentage > 0 && !bestMode && (
                <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 font-medium">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            {/* Dots fixes qui ne scrollent pas */}
            {allImages.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 pointer-events-none">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2 h-2 rounded-full ${i === currentIdx ? 'bg-black' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
      {/* Infos produit */}
      <div className={bestMode ? "flex flex-col px-1 pt-3 pb-1" : "flex-1 flex flex-col px-1 pt-4 pb-1"}>
          <Link href={`/products/${product.slug}`}> 
            <span className={bestMode ? "font-medium tracking-tight text-sm sm:text-lg lg:text-xl truncate block w-full text-center text-black group-hover:text-gray-700 transition-all duration-300 mb-1" : "font-medium tracking-tight text-base truncate block w-full text-black group-hover:text-gray-700 transition-all duration-300 mb-2"}>{product.name}</span>
          </Link>
          {/* Description sur 2 lignes max (cachée en smallCard pour laisser la place au prix) */}
          {!bestMode && !smallCard && product.description && (
            <span className="text-sm text-gray-500 line-clamp-2 mb-3 block min-h-[40px]">{product.description || "Confort et élégance intemporelle."}</span>
          )}
          <div className={(bestMode ? "flex flex-col items-center" : "flex flex-col items-start") + " mt-1 mb-2"}>
            <span className={bestMode ? "font-semibold text-lg sm:text-xl lg:text-2xl text-black truncate text-center" : "font-medium text-lg text-black truncate"}>{formatCurrency(product.price)}</span>
            {/* Prix barré sous le prix principal, sauf bestMode */}
            {!bestMode && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through truncate mt-1">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>
          {/* Bouton ajouter au panier retiré sur les cards comme demandé */}
        </div>
    </div>
  );
}