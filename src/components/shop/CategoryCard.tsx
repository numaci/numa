import Link from "next/link";

// Interface pour les props de la catégorie
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    _count: {
      products: number;
    };
  };
}

// Carte d'affichage d'une catégorie
export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group text-center"
    >
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {category._count.products} produit{category._count.products > 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  );
} 