import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";

interface SimilarProductsProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    imageUrl?: string;
    isActive: boolean;
    stock: number;
    description?: string;
    category: {
      name: string;
      slug: string;
    };
  }>;
  currentProductId: string;
}

export default function SimilarProducts({ products, currentProductId }: SimilarProductsProps) {
  // Filtrer le produit actuel
  const filteredProducts = products.filter(product => product.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
        <Link 
          href="/products" 
          className="text-amber-600 hover:text-amber-800 font-semibold text-sm"
        >
          Voir tous les produits →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            hideCartActions={false}
            smallCard={false}
          />
        ))}
      </div>
    </section>
  );
} 