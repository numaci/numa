"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { FaShoppingCart, FaCheck, FaWhatsapp, FaStar, FaTruck, FaShieldAlt } from "react-icons/fa";
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
    attributes?: any;
    variants?: Array<{ id: string; name: string; value: string; price: number }>;
  };
  whatsappNumber: string;
}

export default function ProductDetailInfo({ product, whatsappNumber }: ProductDetailInfoProps) {
  const { data: session } = useSession();
  const { addToCart, isLoading, error } = useCart();
  const { config, loading } = useShippingConfig();
  const { openCart } = useCartDrawer();
  
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  // Ajout : gestion de la variante sélectionnée
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Prix dynamique selon la variante
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const variant = hasVariants && product.variants ? product.variants[selectedVariantIdx] : null;
  const displayPrice = hasVariants && variant ? Number(variant.price) : product.price;
  const displayComparePrice = hasVariants ? null : product.comparePrice;

  // Calcul de la note moyenne
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    try {
      await addToCart(
        {
          productId: product.id,
          name: product.name + (hasVariants && variant ? ` (${variant.name}: ${variant.value})` : ""),
          price: displayPrice,
          imageUrl: product.imageUrl,
          stock: product.stock,
        },
        quantity
      );
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setQuantity(1);
      // Ouvre le panier après ajout (mobile ET desktop)
      openCart();
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `Bonjour ! Je souhaite commander le produit suivant :\n\n*${product.name}${hasVariants && variant ? ` (${variant.name}: ${variant.value})` : ""}*\nPrix : ${formatCurrency(displayPrice)}\nQuantité : ${quantity}\n\nLien du produit : ${window.location.href}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">
          Catégorie:{" "}
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-amber-600 hover:text-amber-800 font-semibold"
          >
            {product.category.name}
          </Link>
        </p>
      </div>

      {/* Prix */}
      <div className="flex items-center space-x-4">
        <span className="text-4xl font-bold text-amber-600">
          {formatCurrency(displayPrice)}
        </span>
        {displayComparePrice && displayComparePrice > displayPrice && (
          <span className="text-xl text-gray-500 line-through">
            {formatCurrency(displayComparePrice)}
          </span>
        )}
      </div>

      {/* Prix de livraison dynamique pour Sikasso */}
      <div className="flex items-center space-x-2 text-gray-600">
        <FaTruck className="text-amber-500" />
        <span>
          Livraison à Sikasso : {product.price >= (config?.freeThreshold ?? 10000) ? (
            <span className="font-bold text-green-600">Gratuite</span>
          ) : (
            <span className="font-bold">{(config?.fee ?? 500).toLocaleString('fr-FR')} FCFA</span>
          )}
        </span>
      </div>
      <div className="text-xs text-amber-700 mt-1">
        Livraison gratuite à Sikasso dès {(config?.freeThreshold ?? 10000).toLocaleString('fr-FR')} FCFA d’achat, sinon {(config?.fee ?? 500).toLocaleString('fr-FR')} FCFA.
      </div>

      {/* Avis */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-lg ${
                star <= averageRating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {averageRating.toFixed(1)} ({product._count.reviews} avis)
        </span>
      </div>

      {/* Stock */}
      <div className="text-sm">
        {product.stock > 0 ? (
          <span className="text-green-600 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            En stock ({product.stock} disponible{product.stock > 1 ? 's' : ''})
          </span>
        ) : (
          <span className="text-red-600 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Rupture de stock
          </span>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        <div className="text-gray-600 prose max-w-none leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Attributs dynamiques */}
      {product.attributes && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-2">Caractéristiques</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2 text-gray-700">
              {product.category.name === "Vêtements" && product.attributes.sizes && (
                <li className="flex justify-between">
                  <span className="font-medium">Tailles :</span>
                  <span>{Array.isArray(product.attributes.sizes) ? product.attributes.sizes.join(", ") : product.attributes.sizes}</span>
                </li>
              )}
              {product.category.name === "Vêtements" && product.attributes.colors && (
                <li className="flex justify-between">
                  <span className="font-medium">Couleurs :</span>
                  <span>{Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</span>
                </li>
              )}
              {product.category.name === "Téléphones" && product.attributes.storage && (
                <li className="flex justify-between">
                  <span className="font-medium">Stockage :</span>
                  <span>{product.attributes.storage}</span>
                </li>
              )}
              {product.category.name === "Téléphones" && product.attributes.colors && (
                <li className="flex justify-between">
                  <span className="font-medium">Couleurs :</span>
                  <span>{Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</span>
                </li>
              )}
              {product.category.name === "Téléphones" && product.attributes.condition && (
                <li className="flex justify-between">
                  <span className="font-medium">État :</span>
                  <span>{product.attributes.condition === "neuf" ? "Neuf" : "Occasion"}</span>
                </li>
              )}
              {product.category.name === "Chaussures" && product.attributes.sizes && (
                <li className="flex justify-between">
                  <span className="font-medium">Pointures :</span>
                  <span>{Array.isArray(product.attributes.sizes) ? product.attributes.sizes.join(", ") : product.attributes.sizes}</span>
                </li>
              )}
              {product.category.name === "Chaussures" && product.attributes.colors && (
                <li className="flex justify-between">
                  <span className="font-medium">Couleurs :</span>
                  <span>{Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</span>
                </li>
              )}
              {/* Attributs personnalisés pour autres catégories */}
              {!["Vêtements", "Téléphones", "Chaussures"].includes(product.category.name) && product.attributes.custom && (
                <li className="flex justify-between">
                  <span className="font-medium">Détails :</span>
                  <span>{product.attributes.custom}</span>
                </li>
              )}
            </ul>
            {/* Affichage des variantes disponibles */}
            {hasVariants && (
              <div className="mt-4">
                <span className="font-medium">Variantes disponibles :</span>
                <ul className="list-disc ml-6 text-gray-700">
                  {product.variants.map((v) => (
                    <li key={v.id}>
                      {v.value} — {formatCurrency(Number(v.price))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {/* Sélecteur de variante si présent */}
        {hasVariants && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-700 mb-1 uppercase tracking-wide">{product.variants?.[0]?.name ?? ''} :</label>
            <select
              value={selectedVariantIdx}
              onChange={e => setSelectedVariantIdx(Number(e.target.value))}
              className="border-2 border-amber-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 rounded-xl p-2 bg-white text-amber-700 font-semibold shadow w-full max-w-xs transition-all duration-150 outline-none"
              style={{ boxShadow: '0 0 0 2px #f59e42 inset' }}
            >
              {product.variants?.map((v, idx) => (
                <option key={v.id} value={idx} className="text-amber-700 font-semibold bg-white">
                  {v.value} ({formatCurrency(Number(v.price))})
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Sélecteur de quantité */}
        {product.stock > 0 && (
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity-detail" className="text-sm font-medium text-gray-700">
              Quantité:
            </label>
            <select
              id="quantity-detail"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500 bg-white"
              disabled={isLoading}
            >
              {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <ShareButtonClient productName={product.name} />
          </div>
        )}
        {/* Bouton Ajouter au panier en haut (mobile/desktop) */}
        <Button 
          size="lg" 
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xl py-5 min-h-[56px] shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={product.stock === 0 || isLoading}
          onClick={handleAddToCart}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Ajout en cours...
            </>
          ) : showSuccess ? (
            <>
              <FaCheck size={24} />
              Ajouté !
            </>
          ) : (
            <>
              <FaShoppingCart size={24} />
              Ajouter au panier
            </>
          )}
        </Button>
        {/* Bouton Commander sur WhatsApp visible partout */}
        <Button 
          variant="outline" 
          size="lg"
          className="w-full flex items-center justify-center gap-3 rounded-xl border-green-500 text-green-600 hover:bg-green-50 font-semibold text-xl py-5 min-h-[56px] transition-all duration-200"
          onClick={handleWhatsAppOrder}
        >
          <FaWhatsapp size={24} />
          Commander sur WhatsApp
        </Button>
        {/* Boutons d'action desktop/tablette (comportement actuel) */}
        {/* SUPPRIMÉ : bouton WhatsApp doublon en bas */}

        {/* Messages d'erreur et d'information */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        {!session && product.stock > 0 && (
          <p className="text-blue-600 text-sm text-center bg-blue-50 p-3 rounded-lg">
            Connectez-vous pour sauvegarder votre panier
          </p>
        )}
      </div>

      {/* Garanties et informations */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <FaShieldAlt className="text-amber-500" />
          <span className="text-sm text-gray-700">Garantie satisfait ou remboursé</span>
        </div>
        <div className="flex items-center space-x-3">
          <FaTruck className="text-amber-500" />
          <span className="text-sm text-gray-700">Livraison rapide et sécurisée</span>
        </div>
        <div className="flex items-center space-x-3">
          <FaCheck className="text-amber-500" />
          <span className="text-sm text-gray-700">Produit authentique et de qualité</span>
        </div>
      </div>
    </div>
  );
} 