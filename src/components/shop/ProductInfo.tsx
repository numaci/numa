"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { FaShoppingCart, FaCheck, FaHeart } from "react-icons/fa";

// Fonction pour formater la monnaie
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
            currency: "XOF",
  }).format(amount).replace("F", "FCFA");
}

// Interface pour les props des informations produit
interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    description: string;
    imageUrl?: string;
    category: {
      name: string;
      slug: string;
    };
    reviews: Array<{
      rating: number;
    }>;
    _count: {
      reviews: number;
    };
    attributes?: Record<string, unknown>;
  };
}

// Composant d'affichage des informations d'un produit
export default function ProductInfo({ product }: ProductInfoProps) {
  const { data: session } = useSession();
  const { addToCart, isLoading, error } = useCart();
  
  // Calcul de la note moyenne
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

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
    } catch (error) {
      // console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 hover:text-amber-600 transition-colors">{product.name}</h1>
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
        <span className="text-3xl font-bold text-amber-600">
          {formatCurrency(product.price)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-xl text-gray-500 line-through">
            {formatCurrency(product.comparePrice)}
          </span>
        )}
      </div>

      {/* Avis */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                star <= averageRating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {averageRating.toFixed(1)} ({product._count.reviews} avis)
        </span>
      </div>

      {/* Stock */}
      <div className="text-sm">
        {product.stock > 0 ? (
          <span className="text-green-600">✓ En stock</span>
        ) : (
          <span className="text-red-600">✗ Rupture de stock</span>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
        <div className="text-gray-600 prose max-w-none">
          {product.description}
        </div>
        {/* Attributs dynamiques */}
        {product.attributes && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-1">Caractéristiques</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              {product.category.name === "Vêtements" && product.attributes.sizes && (
                <li>Tailles : {Array.isArray(product.attributes.sizes) ? product.attributes.sizes.join(", ") : product.attributes.sizes}</li>
              )}
              {product.category.name === "Vêtements" && product.attributes.colors && (
                <li>Couleurs : {Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</li>
              )}
              {product.category.name === "Téléphones" && product.attributes.storage && (
                <li>Stockage : {product.attributes.storage}</li>
              )}
              {product.category.name === "Téléphones" && product.attributes.colors && (
                <li>Couleurs : {Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</li>
              )}
              {product.category.name === "Téléphones" && product.attributes.condition && (
                <li>État : {product.attributes.condition === "neuf" ? "Neuf" : "Occasion"}</li>
              )}
              {product.category.name === "Chaussures" && product.attributes.sizes && (
                <li>Pointures : {Array.isArray(product.attributes.sizes) ? product.attributes.sizes.join(", ") : product.attributes.sizes}</li>
              )}
              {product.category.name === "Chaussures" && product.attributes.colors && (
                <li>Couleurs : {Array.isArray(product.attributes.colors) ? product.attributes.colors.join(", ") : product.attributes.colors}</li>
              )}
              {/* Attributs personnalisés pour autres catégories */}
              {!["Vêtements", "Téléphones", "Chaussures"].includes(product.category.name) && product.attributes.custom && (
                <li>{product.attributes.custom}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* Sélecteur de quantité */}
        {product.stock > 0 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="quantity-detail" className="text-sm text-gray-600">
              Quantité:
            </label>
            <select
              id="quantity-detail"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
              disabled={isLoading}
            >
              {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={product.stock === 0 || isLoading}
            onClick={handleAddToCart}
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
          
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold text-lg transition-all duration-200"
          >
            <FaHeart />
            Ajouter aux favoris
          </Button>
        </div>

        {/* Messages d'erreur et d'information */}
        {error && (
          <p className="text-red-600 text-xs text-center">{error}</p>
        )}

        {!session && product.stock > 0 && (
          <p className="text-blue-600 text-xs text-center">
            Connectez-vous pour sauvegarder votre panier
          </p>
        )}
      </div>
    </div>
  );
} 