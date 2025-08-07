import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { Product } from "@/types";

interface SimilarProductsProps {
  products: Product[];
  currentProductId: string;
}

export default function SimilarProducts({ products, currentProductId }: SimilarProductsProps) {
  // Filtrer pour exclure le produit actuel et limiter à 4 produits
  const filteredProducts = products
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);

  if (filteredProducts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-black tracking-tight">Produits similaires</h2>
        <Link 
          href="/products" 
          className="text-sm text-black hover:text-gray-600 transition-colors duration-200"
        >
          Voir tous les produits
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}