import { prisma } from '@/lib/prisma';
import EditAdFormClient from './EditAdFormClient';

export default async function EditAdPage({ params }: { params: { id: string } }) {
  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  if (!ad) return <div>Publicité introuvable</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Éditer la publicité</h1>
      <EditAdFormClient ad={ad} products={products} adId={params.id} />
    </div>
  );
} 