"use client";

import { Search, RotateCcw } from "lucide-react";

// Types pour les props du composant
interface CategoryFiltersProps {
  searchTerm: string;
  statusFilter: "all" | "active" | "inactive";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  onReset: () => void;
}

// Composant pour les filtres de catégories
export default function CategoryFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onReset,
}: CategoryFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-300 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
            />
          </div>
        </div>

        {/* Filtre par statut */}
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
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