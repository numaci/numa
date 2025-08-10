"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image"; // 📸 1. Import de next/image
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { FaCheck, FaWhatsapp, FaStar, FaTruck, FaShieldAlt } from "react-icons/fa";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import ShareButtonClient from "@/app/(client)/products/[slug]/ShareButtonClient";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

// Fonction pour formater la monnaie
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount).replace("F", "FCFA");
}

interface ProductDetailInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    description: string;
    imageUrl?: string;
    images?: string; // 📸 1. S'attendre à une chaîne JSON d'images
    shippingPrice?: number | null;
    category: {
      name: string;
      slug: string;
    };
    reviews: Array<{
      rating: number;
      title?: string;
      comment?: string;
      createdAt: Date;
      user: {
        firstName?: string;
        lastName?: string;
      };
    }>;
    _count: {
      reviews: number;
    };
    attributes?: Record<string, unknown>;
    variants?: Array<{ id: string; name: string; value: string; price: number; stock: number }>;
  };
}

export default function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const { data: session } = useSession();
  const { addToCart, isLoading, error } = useCart();
  const { config, loading } = useShippingConfig();
  const { openCart } = useCartDrawer();



  // --- State Management for Variants and Quantity ---
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Derived State from Props and State ---
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  const selectedVariant = hasVariants && product.variants && selectedVariantIdx !== null 
    ? product.variants[selectedVariantIdx] 
    : null;

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : product.price;
  const displayComparePrice = hasVariants ? null : product.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;
  // 📏 2. Vérifier si une taille doit être sélectionnée mais ne l'est pas
  const isSizeSelectionRequired = hasVariants && selectedVariant === null;

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  // --- Event Handlers ---
  const handleAddToCart = async () => {
    if (isOutOfStock || isSizeSelectionRequired) return;

    try {
      await addToCart(
        {
          productId: product.id,
          name: product.name + (selectedVariant ? ` (${selectedVariant.name}: ${selectedVariant.value})` : ""),
          price: displayPrice,
          imageUrl: product.imageUrl,
          stock: currentStock,
        },
        quantity
      );
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setQuantity(1);
      openCart();
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  // 📱 3. Logique de commande WhatsApp mise à jour
  const handleWhatsAppOrder = () => {
    if (isSizeSelectionRequired) {
      alert("Veuillez sélectionner une taille.");
      return;
    }
    const taille = selectedVariant ? selectedVariant.value : 'Taille unique';
    const message = `Bonjour NUMA 👋, je souhaite commander :\nProduit : ${product.name}\nTaille : ${taille}\nPrix : ${formatCurrency(displayPrice)} FCFA`;
    const whatsappUrl = `https://wa.me/2250700247693?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-black tracking-tight mb-2">{product.name}</h1>
          <p className="text-gray-500">
            Collection:{" "}
            <Link href={`/products?category=${product.category.slug}`} className="text-black hover:text-gray-700 font-medium">
              {product.category.name}
            </Link>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-4xl font-semibold text-black">{formatCurrency(displayPrice)}</span>
          {displayComparePrice && displayComparePrice > displayPrice && (
            <span className="text-xl text-gray-400 line-through">{formatCurrency(displayComparePrice)}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} className={`text-lg ${star <= averageRating ? "text-black" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-sm text-gray-500">{averageRating.toFixed(1)} ({product._count.reviews} avis)</span>
        </div>

        <div className="text-sm">
          {isOutOfStock ? (
            <span className="text-gray-500 flex items-center space-x-2"><div className="w-2 h-2 bg-gray-500 rounded-full"></div><span>Indisponible</span></span>
          ) : (
            <span className="text-black flex items-center space-x-2"><div className="w-2 h-2 bg-black rounded-full"></div><span>Disponible ({currentStock} en stock)</span></span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
          <div className="text-gray-500 prose max-w-none leading-relaxed">{product.description}</div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {hasVariants && (
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                {product.variants?.[0]?.name || 'Taille'}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((v, idx) => {
                  const isSelected = selectedVariantIdx === idx;
                  const isVariantOutOfStock = v.stock === 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isVariantOutOfStock && setSelectedVariantIdx(idx)}
                      disabled={isVariantOutOfStock}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-black bg-black text-white' : isVariantOutOfStock ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white text-black hover:border-black'}`}>
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {!isOutOfStock && (
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity-detail" className="text-sm font-medium text-black">Quantité:</label>
              <select id="quantity-detail" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black bg-white" disabled={isLoading}>
                {Array.from({ length: Math.min(10, currentStock) }, (_, i) => i + 1).map((num) => (<option key={num} value={num}>{num}</option>))}
              </select>
            </div>
          )}

                    <Button variant="secondary" size="lg" className="w-full" disabled={isOutOfStock || isLoading || isSizeSelectionRequired} onClick={handleAddToCart}>
            {isLoading ? 'Ajout en cours...' : showSuccess ? 'Ajouté !' : 'Ajouter au panier'}
          </Button>
          
          <Button variant="outline" size="lg" className="w-full" onClick={handleWhatsAppOrder} disabled={isSizeSelectionRequired}>
            <FaWhatsapp className="mr-2" />
            Commander sur WhatsApp
          </Button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </div>
    </div>
  );
}