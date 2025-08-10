import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function ShippingAdminPage() {
  // Récupérer la config active pour Sikasso
  const config = await prisma.shippingConfig.findFirst({
    where: { city: "Sikasso", isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuration des frais de livraison</h1>
      <form action="/api/admin/shipping-config" method="POST" className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input
            name="city"
            defaultValue={config?.city || "Sikasso"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de livraison gratuite (FCFA)</label>
          <input
            type="number"
            name="freeThreshold"
            defaultValue={config?.freeThreshold || 10000}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frais de livraison (FCFA)</label>
          <input
            type="number"
            name="fee"
            defaultValue={config?.fee || 500}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600">Enregistrer</button>
      </form>
      {config && (
        <div className="mt-6 text-sm text-gray-600">
          <strong>Configuration actuelle :</strong><br />
          Seuil gratuit : {config.freeThreshold} FCFA<br />
          Frais : {config.fee} FCFA
        </div>
      )}
    </div>
  );
} 