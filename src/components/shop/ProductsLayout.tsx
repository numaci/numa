import { Suspense } from "react";
import ProductsHeader from "./ProductsHeader";
import ProductGrid from "./ProductGrid";

// Interface pour les props du layout des produits
interface ProductsLayoutProps {
  products: Array<any>;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

// Composant de chargement
function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-white border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-6 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Layout principal de la page des produits
export default function ProductsLayout({
  products,
  totalProducts,
  currentPage,
  totalPages,
}: ProductsLayoutProps) {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ProductsHeader />
        {/* Grille de produits */}
        <div className="w-full mt-8">
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid
              products={products}
              totalProducts={totalProducts}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}