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
    <div className="admin-card">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="admin-input pl-10 placeholder-gray-500 text-black antialiased"
            />
          </div>
        </div>

        {/* Filtre par catégorie */}
        <div className="md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="admin-input text-black antialiased"
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
            className="admin-input text-black antialiased"
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
          className="admin-button admin-button-secondary inline-flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-gray-600" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
}