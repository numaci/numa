import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

function transformProduct(product: Record<string, unknown>) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

export default async function HomeSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Récupérer la section et ses produits
  const section = await prisma.homeSection.findUnique({
    where: { id },
    include: {
      products: {
        include: { product: { include: { category: { select: { name: true, slug: true } } } } },
        orderBy: { order: "asc" }
      }
    }
  });
  if (!section) return <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">Section introuvable</div>;

  const products = section.products.map(sp => sp.product).filter(Boolean).map(transformProduct);
  const productIds = products.map(p => p.id);

  // Proposer d'autres produits actifs non présents dans la section
  const otherProductsRaw = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: productIds }
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: { select: { name: true, slug: true } } }
  });
  const otherProducts = otherProductsRaw.map(transformProduct);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 rounded-2xl shadow-2xl bg-white/90">
        {/* Header sticky façon page produit */}
        <div className="sticky top-0 z-30 bg-white/90 shadow-sm flex items-center justify-between px-4 py-3 mb-2 sm:static sm:shadow-none sm:mb-0 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Link href="/products" className="text-amber-600 hover:text-amber-800 p-2 rounded-full transition-colors" title="Retour à la boutique">
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-2xl text-amber-700 truncate max-w-[70vw]">{section.title}</h1>
          </div>
          <span className="hidden sm:block text-sm text-amber-700 font-medium">{products.length} produit{products.length > 1 ? 's' : ''}</span>
        </div>
        {/* Titre principal comme sur le catalogue */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{section.title}</h1>
          <p className="text-gray-600">Découvrez notre sélection de produits pour cette section</p>
        </div>
        {/* Grille de produits principale */}
        <ProductGrid products={products} hideCartActions={false} smallCard={true} />
        {/* Section suggestions */}
        {otherProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Vous aimerez aussi</h2>
            <ProductGrid products={otherProducts} hideCartActions={false} smallCard={true} />
          </div>
        )}
      </div>
    </div>
  );
} 