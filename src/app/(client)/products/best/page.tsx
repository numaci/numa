import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";

// Fonction pour convertir les objets Decimal en nombres
function transformProduct(product: any) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

export default async function BestProductsPage() {
  // Récupérer tous les produits isBest=true, paginés (par 24)
  const bestProducts = await prisma.product.findMany({
    where: { isActive: true, isBest: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
    },
    take: 100, // Afficher jusqu'à 100, ajuster si besoin
  });
  const bestProductsTransformed = bestProducts.map(transformProduct);

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