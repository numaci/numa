import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";

// Empêche la pré-génération statique qui provoquerait un accès DB au build
export const dynamic = 'force-dynamic';

// Fonction pour convertir les objets Decimal en nombres
function transformProduct(product: Record<string, unknown>) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

export default async function BestProductsPage() {
  // Récupérer tous les produits isBest=true
  let bestProductsTransformed: any[] = [];
  try {
    const bestProducts = await prisma.product.findMany({
      where: { isActive: true, isBest: true },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
      },
      take: 100,
    });
    bestProductsTransformed = bestProducts.map(transformProduct);
  } catch (e) {
    // En build/export, ignorer les erreurs DB et afficher une page vide
    console.error('Erreur de récupération des best products:', e);
    bestProductsTransformed = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tous nos meilleures produits</h1>
      <ProductGrid
        products={bestProductsTransformed}
        hideCartActions={true}
        smallCard={true}
        horizontalOnMobile={false}
      />
      {bestProductsTransformed.length === 0 && (
        <div className="text-center text-gray-500 py-12">Aucun produit vedette pour le moment.</div>
      )}
    </div>
  );
} 