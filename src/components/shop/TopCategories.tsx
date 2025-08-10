"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FaArrowRight } from "react-icons/fa";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  _count: {
    products: number;
  };
}

interface TopCategoriesProps {
  categories: Category[];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  // Prendre seulement les 4 premières catégories
  const topCategories = categories.slice(0, 4);
  
  // Sur mobile, on affiche seulement les 2 premières catégories
  const mobileCategories = topCategories.slice(0, 2);

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4">
        {/* En-tête de la section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Top Catégories
          </h2>
        </div>

        {/* Grille des catégories - Mobile (2 catégories) */}
        <div className="grid grid-cols-2 md:hidden gap-6 mb-8">
          {mobileCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:border-2 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1 block w-full h-full cursor-pointer touch-manipulation"
            >
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                {category.imageUrl && category.imageUrl !== "" ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Overlay au survol */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none" />
                {/* Badge avec nombre de produits */}
                <div className="absolute top-2 right-2 bg-amber-400 bg-opacity-90 rounded-full px-3 py-1 shadow">
                  <span className="text-xs font-semibold text-white">
                    {category._count.products} produits
                  </span>
                </div>
              </div>
              <div className="p-3 relative z-10">
                <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-xs text-amber-600 font-medium">
                  {category._count.products} produits
                </p>
                {/* Indicateur de clic pour mobile */}
                <div className="absolute inset-0 bg-transparent group-active:bg-amber-50 transition-colors rounded-b-2xl" />
              </div>
            </Link>
          ))}
        </div>

        {/* Grille des catégories - Desktop (4 catégories) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:border-2 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                {category.imageUrl && category.imageUrl !== "" ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Overlay au survol */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none" />
                {/* Badge avec nombre de produits */}
                <div className="absolute top-2 right-2 bg-amber-400 bg-opacity-90 rounded-full px-3 py-1 shadow">
                  <span className="text-xs font-semibold text-white">
                    {category._count.products} produits
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
                {category.description && category.description !== "" && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-amber-600 font-medium">
                  {category._count.products} produits
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bouton pour voir toutes les catégories */}
        <div className="text-center">
          <Link href="/categories">
            <Button 
              variant="outline" 
              size="lg"
              className="inline-flex items-center gap-2 rounded-full border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold text-base transition-all duration-200"
            >
              Voir toutes les catégories
              <FaArrowRight className="text-sm" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 