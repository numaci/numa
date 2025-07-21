"use client";

import Link from "next/link";
import { Category } from "@/hooks/useCategories";
import { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

// Types pour les props du composant
interface CategoryTableProps {
  categories: Category[];
  onDelete: (category: Category) => void;
}

// Composant pour le tableau des catégories
export default function CategoryTable({ categories, onDelete }: CategoryTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { updateCategory } = useCategories();
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          Aucune catégorie trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-orange-100 text-sm md:text-base bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
        <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl whitespace-nowrap">Image</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Catégorie</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Slug</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Produits</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Statut</th>
            <th className="px-4 md:px-6 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Publique</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Date de création</th>
            <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/70 divide-y divide-orange-50">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-orange-50/60 transition">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-12 w-12 rounded-lg object-cover border border-orange-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 text-xs">Aucune</span>
                  </div>
                )}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-bold text-orange-800">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-orange-400">{category.description}</div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs text-orange-400 hidden sm:table-cell">
                {category.slug}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                {category.productCount} produit{category.productCount !== 1 ? 's' : ''}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow ${category.isActive ? "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900" : "bg-gradient-to-r from-red-200 to-red-400 text-red-900"}`}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={category.isPublic}
                  onChange={async (e) => {
                    await updateCategory(category.id, {
                      name: category.name,
                      slug: category.slug,
                      isPublic: e.target.checked,
                      description: category.description,
                      imageUrl: category.imageUrl,
                      isActive: category.isActive,
                    });
                  }}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-orange-300 rounded"
                  title="Afficher sur la page d'accueil/pub"
                />
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs text-orange-400 hidden sm:table-cell">
                {new Date(category.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative flex justify-end">
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-orange-100 text-orange-600 hover:text-orange-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
                    title="Actions"
                    onClick={() => setOpenMenu(openMenu === category.id ? null : category.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === category.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
                      <a
                        href={`/admin/categories/${category.id}/edit`}
                        className="w-full flex items-center gap-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 rounded-t-xl transition"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </a>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-xl transition"
                        onClick={() => { onDelete(category); setOpenMenu(null); }}
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
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