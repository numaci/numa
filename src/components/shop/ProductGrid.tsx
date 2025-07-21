"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/Button";

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
}

// Interface pour les props du composant ProductGrid
interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: string, quantity: number) => void;
  isLoading?: boolean;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  hideCartActions?: boolean; // Ajouté pour masquer les actions panier/stock/quantité
  smallCard?: boolean; // Ajouté pour réduire la taille des cards
  horizontalOnMobile?: boolean; // Ajouté pour scroll horizontal mobile
}

// Composant ProductGrid pour afficher une grille de produits
// Inclut la pagination et la gestion de l'ajout au panier
export default function ProductGrid({ 
  products, 
  onAddToCart, 
  isLoading = false,
  totalProducts = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hideCartActions = false,
  smallCard = false,
  horizontalOnMobile = false
}: ProductGridProps) {
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Gestion de l'ajout au panier avec feedback visuel
  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!onAddToCart) return;
    
    setAddingProductId(productId);
    try {
      await onAddToCart(productId, quantity);
    } finally {
      setAddingProductId(null);
    }
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Affichage si aucun produit
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun produit trouvé
        </h3>
        <p className="text-gray-600 mb-6">
          Essayez de modifier vos critères de recherche ou de filtres.
        </p>
        <Button onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Informations sur les résultats */}
      {totalProducts > 0 && (
        <div className="text-sm text-gray-600">
          {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
          {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
        </div>
      )}

      {/* Grille de produits */}
      <div
        className={
          horizontalOnMobile
            ? "flex gap-3 sm:gap-2 items-stretch sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-auto scrollbar-hide"
            : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-3"
        }
        style={horizontalOnMobile ? { WebkitOverflowScrolling: 'touch' } : { overflowY: 'visible', maxHeight: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={
              smallCard
                ? horizontalOnMobile
                  ? "w-36 max-w-[9.5rem] h-full sm:w-56 sm:max-w-[14rem] sm:h-64 sm:max-h-[18rem] lg:w-64 lg:max-w-[18rem] lg:h-72"
                  : "w-full max-w-xs sm:w-48 sm:max-w-[12rem]"
                : ""
            }
          >
            <ProductCard
              product={product}
              onAddToCart={hideCartActions ? undefined : handleAddToCart}
              hideCartActions={hideCartActions}
              smallCard={smallCard}
              bestMode={smallCard && hideCartActions && horizontalOnMobile}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center space-x-2 mt-10">
          {/* Bouton précédent */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-full border-amber-400 text-amber-600 hover:bg-amber-50"
          >
            ← Précédent
          </Button>

          {/* Numéros de page */}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 p-0 rounded-full ${page === currentPage ? 'bg-amber-500 text-white' : 'border-amber-300 text-amber-600 hover:bg-amber-50'}`}
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          {/* Bouton suivant */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-full border-amber-400 text-amber-600 hover:bg-amber-50"
          >
            Suivant →
          </Button>
        </div>
      )}
    </div>
  );
} 