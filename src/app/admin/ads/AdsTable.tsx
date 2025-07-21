"use client";
import Link from "next/link";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

type Ad = {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
};

export default function AdsTable({ ads }: { ads: Ad[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-orange-100 text-sm md:text-base bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
        <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl whitespace-nowrap">Titre</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Ordre</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Active</th>
            <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/70 divide-y divide-orange-50">
          {ads.map(ad => (
            <tr key={ad.id} className="hover:bg-orange-50/60 transition">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-orange-900 font-semibold">{ad.title}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-orange-900 font-semibold">{ad.order}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                {ad.isActive ? (
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full shadow bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900">Oui</span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full shadow bg-gradient-to-r from-red-200 to-red-400 text-red-900">Non</span>
                )}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end">
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-orange-100 text-orange-600 hover:text-orange-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
                    title="Actions"
                    onClick={() => setOpenMenu(openMenu === ad.id ? null : ad.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === ad.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
                      <Link
                        href={`/admin/ads/${ad.id}/edit`}
                        className="w-full flex items-center gap-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 rounded-t-xl transition"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Edit className="w-4 h-4" /> Éditer
                      </Link>
                      <form action={`/api/admin/ads/${ad.id}`} method="POST" onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' });
                        setOpenMenu(null);
                        window.location.reload();
                      }}>
                        <button type="submit" className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-xl transition">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 