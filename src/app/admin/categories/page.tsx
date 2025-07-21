"use client";

import {
  CategoryFilters,
  CategoryTable,
  PageHeader,
  LoadingState,
  ErrorState,
  DeleteModal,
} from "@/components/admin/categories";
import { useCategories } from "@/hooks/useCategories";

// Page principale de gestion des catégories
export default function CategoriesPage() {
  const {
    // États
    categories,
    loading,
    error,
    filters,
    deleteModalOpen,
    categoryToDelete,
    deleting,
    
    // Actions
    fetchCategories,
    updateFilters,
    resetFilters,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Catégories</h1>
        <div className="flex gap-4">
          <a href="/admin/categories/new" className="inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Nouvelle Catégorie</a>
          <a href="/admin/home-sections" className="inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Gérer les sections d'accueil</a>
        </div>
      </div>
      {/* Filtres et recherche */}
      <CategoryFilters
        searchTerm={filters.search}
        statusFilter={filters.status}
        onSearchChange={(value) => updateFilters({ search: value })}
        onStatusChange={(value) => updateFilters({ status: value })}
        onReset={resetFilters}
      />

      {/* Tableau des catégories */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <LoadingState message="Chargement des catégories..." />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchCategories} />
        ) : (
          <CategoryTable
            categories={categories}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        categoryName={categoryToDelete?.name}
        productCount={categoryToDelete?.productCount}
        loading={deleting}
      />
    </div>
  );
} 