import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ProductGrid from "./ProductGrid";

// Interface pour les props des produits
interface FeaturedProductsProps {
  products: Array<any>; // Type à définir selon la structure des produits
}

// Section des produits en vedette
export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Produits en vedette
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Découvrez nos produits les plus populaires et les mieux notés
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun produit en vedette pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Nos produits en vedette apparaîtront ici bientôt.
          </p>
          <Link href="/products">
            <Button>
              Voir tous les produits
            </Button>
          </Link>
        </div>
      )}

      <div className="text-center mt-8">
        <Link href="/products">
          <Button>
            Voir tous les produits
          </Button>
        </Link>
      </div>
    </section>
  );
} 