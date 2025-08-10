export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/shop/HeroSection";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import PopularCategories from "@/components/shop/PopularCategories";
import AdvantagesSection from "@/components/shop/AdvantagesSection";
import NewsletterSection from "@/components/shop/NewsletterSection";
import CartDebug from "@/components/debug/CartDebug";
import CartCounter from "@/components/debug/CartCounter";

// Fonction pour convertir les objets Decimal en nombres
function transformProduct(product: Record<string, unknown>) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

// Page d'accueil de la boutique
export default async function HomePage() {
  try {
    // Récupération des produits en vedette
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 8,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Récupération des catégories populaires
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    // Conversion des objets Decimal en nombres
    const products = featuredProducts.map(transformProduct);

    return (
      <div className="min-h-screen animate-fade-in">
        <HeroSection />
        <FeaturedProducts products={products} />
        <PopularCategories categories={categories} />
        <AdvantagesSection />
        <NewsletterSection />
        
        {/* Composants de débogage - à retirer en production */}
        <CartDebug />
        <CartCounter />
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">
            Impossible de charger les données de la page d'accueil.
          </p>
        </div>
      </div>
    );
  }
} 