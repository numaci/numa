import { prisma } from '@/lib/prisma';
import { Product, Supplier } from '@prisma/client';
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
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Produits en attente de validation</h1>
      {products.length === 0 ? (
        <div className="text-gray-500">Aucun produit en attente.</div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <ProductValidationCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 