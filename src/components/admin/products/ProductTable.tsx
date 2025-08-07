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

// Statut badge moderne avec palette NUMA
const getStatusClass = (product: Product) => {
  if (!product.isActive) return "bg-gray-200 text-gray-800";
  if (product.stock === 0) return "bg-red-100 text-red-800";
  if (product.stock < 10) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-visible z-0">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <FiBox className="text-gray-700" size={22} />
        <h3 className="text-lg font-semibold tracking-tight antialiased text-black">Liste des produits</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="text-left">Produit</th>
              <th className="text-left">Catégorie</th>
              <th className="text-left">Prix</th>
              <th className="text-left">Stock</th>
              <th className="text-left">Statut</th>
              <th className="text-left hidden sm:table-cell">Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">IMG</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-black antialiased">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 antialiased">
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black font-medium antialiased">
                  {product.category.name}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black font-semibold antialiased">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black font-medium antialiased">
                  {product.stock}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg ${getStatusClass(product)}`}>
                    {getProductStatus(product)}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell antialiased">
                  {formatDate(product.createdAt)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative flex justify-end">
                    <button
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      title="Actions"
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200 antialiased"
                          onClick={() => { window.location.href = `/admin/products/${product.id}`; setOpenMenu(null); }}
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 antialiased"
                          onClick={() => { window.location.href = `/admin/products/${product.id}/edit`; setOpenMenu(null); }}
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200 antialiased"
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