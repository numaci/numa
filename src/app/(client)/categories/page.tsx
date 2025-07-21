import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function CategoriesPage() {
  // Récupérer les catégories actives avec leur image
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Catégories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products/category/${cat.slug}`}
            className="group block rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white dark:bg-gray-900"
          >
            <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                  sizes="(max-width: 768px) 100vw, 20vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Pas d'image
                </div>
              )}
            </div>
            <div className="p-3 text-center">
              <span className="font-medium text-lg">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 