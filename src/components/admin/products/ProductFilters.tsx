"use client";

import { Search, RotateCcw } from "lucide-react";
import React from "react";

// Types pour les catégories
interface Category {
  id: string;
  name: string;
}

// Types pour les props du composant
interface ProductFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  statusFilter: string;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
  { value: "outOfStock", label: "Rupture de stock" },
  { value: "lowStock", label: "Stock faible" },
];

export default function ProductFilters({
  searchTerm,
  selectedCategory,
  statusFilter,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-300 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
            />
          </div>
        </div>

        {/* Filtre par catégorie */}
        <div className="md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par statut */}
        <div className="md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton de réinitialisation */}
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-orange-400" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
} 