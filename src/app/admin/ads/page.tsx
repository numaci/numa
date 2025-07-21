import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdsTable from "./AdsTable";

export default async function AdsAdminPage() {
  const ads = await prisma.ad.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-orange-800">Gestion des Publicités</h1>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm font-semibold">{ads.length} pub{ads.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ads/new" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 transition-colors">
            <Plus className="w-4 h-4 mr-2 text-orange-200" /> Ajouter une publicité
          </Link>
          <Link href="/admin/shipping" className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-400 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" /></svg>
            Configurer livraison
          </Link>
        </div>
      </div>
      <AdsTable ads={ads} />
    </div>
  );
} 