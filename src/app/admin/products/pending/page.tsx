import { prisma } from '@/lib/prisma';
import ProductValidationCard from './ProductValidationCard';

export const dynamic = 'force-dynamic';

async function getPendingProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'PENDING' },
    include: { supplier: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
  // Convertit les champs Decimal en string pour Next.js
  return products.map((product) => ({
    ...product,
    price: product.price?.toString(),
    comparePrice: product.comparePrice?.toString() ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    supplier: product.supplier,
    category: product.category,
  }));
}

export default async function PendingProductsPage() {
  const products = await getPendingProducts();

  return (
    <div className="bg-white min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="admin-card mb-6">
          <h1 className="text-3xl font-semibold tracking-tight antialiased text-black mb-2">Produits en attente de validation</h1>
          <p className="text-gray-600 antialiased">Validez ou rejetez les produits soumis par les fournisseurs</p>
        </div>
        
        {products.length === 0 ? (
          <div className="admin-card text-center py-12">
            <div className="text-gray-500 antialiased text-lg">Aucun produit en attente de validation.</div>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <ProductValidationCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}