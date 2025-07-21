"use client";

import Link from "next/link";
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { FiBox } from "react-icons/fi";
import { useState } from "react";

// Types pour les produits
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  category: {
    name: string;
  };
  createdAt: string;
}

// Types pour les props du composant
interface ProductTableProps {
  products: Product[];
  onDelete: (productId: string) => void;
  onToggleActive: (productId: string, isActive: boolean) => void;
}

// Statut badge moderne
const getStatusClass = (product: Product) => {
  if (!product.isActive) return "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800";
  if (product.stock === 0) return "bg-gradient-to-r from-red-400 to-red-600 text-white";
  if (product.stock < 10) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
  return "bg-gradient-to-r from-green-400 to-green-600 text-white";
};

// Composant du tableau des produits
export default function ProductTable({ products, onDelete, onToggleActive }: ProductTableProps) {
  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(price).replace("F", "FCFA");
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Fonction pour obtenir le statut du produit
  const getProductStatus = (product: Product) => {
    if (!product.isActive) return "Inactif";
    if (product.stock === 0) return "Rupture";
    if (product.stock < 10) return "Stock faible";
    return "En stock";
  };

  // Menu d'actions contextuel
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-visible z-0">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white rounded-t-2xl">
        <FiBox className="text-orange-500" size={22} />
        <h3 className="text-lg font-bold text-orange-700">Liste des produits</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-100 text-sm md:text-base">
          <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl whitespace-nowrap">Produit</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Catégorie</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Prix</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Statut</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Date</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 divide-y divide-orange-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-orange-50/60 transition">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-xl object-cover shadow border border-orange-100"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-400 text-sm">IMG</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-orange-800">
                        {product.name}
                      </div>
                      <div className="text-xs text-orange-400">
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                  {product.category.name}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                  {product.stock}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow ${getStatusClass(product)}`}>
                    {getProductStatus(product)}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-500 hidden sm:table-cell">
                  {formatDate(product.createdAt)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative flex justify-end">
                    <button
                      className="p-2 rounded-full bg-white/10 hover:bg-orange-100 text-orange-600 hover:text-orange-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
                      title="Actions"
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-t-xl transition"
                          onClick={() => { window.location.href = `/admin/products/${product.id}`; setOpenMenu(null); }}
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 transition"
                          onClick={() => { window.location.href = `/admin/products/${product.id}/edit`; setOpenMenu(null); }}
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-xl transition"
                          onClick={() => { onDelete(product.id); setOpenMenu(null); }}
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 px-4 py-2 ${product.isActive ? 'text-gray-700 hover:bg-gray-50' : 'text-green-700 hover:bg-green-50'} rounded-b-xl transition`}
                          onClick={() => { onToggleActive(product.id, product.isActive); setOpenMenu(null); }}
                        >
                          {product.isActive ? (
                            <>
                              <span className="w-4 h-4 inline-block bg-gray-400 rounded-full mr-1" /> Désactiver
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 inline-block bg-green-500 rounded-full mr-1" /> Activer
                            </>
                          )}
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
    </div>
  );
} 