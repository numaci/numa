import Link from "next/link";
import { Button } from "@/components/ui/Button";
import CategoryCard from "./CategoryCard";

// Interface pour les props des catégories
interface PopularCategoriesProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: {
      products: number;
    };
  }>;
}

// Section des catégories populaires
export default function PopularCategories({ categories }: PopularCategoriesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Explorez nos catégories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Trouvez facilement ce que vous cherchez grâce à nos catégories organisées
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/categories">
          <Button variant="outline">
            Voir toutes les catégories
          </Button>
        </Link>
      </div>
    </section>
  );
} 