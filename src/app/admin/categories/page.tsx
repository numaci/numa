"use client";

import {
  CategoryFilters,
  CategoryTable,
  LoadingState,
  ErrorState,
  DeleteModal,
} from "@/components/admin/categories";
import PageHeader from "@/components/admin/PageHeader";
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
    <div className="bg-white min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <PageHeader 
          title="Gestion des catégories"
          subtitle="Créez et gérez les catégories de produits de votre boutique"
          actionLabel="Nouvelle Catégorie"
          actionHref="/admin/categories/new"
        />
        {/* Filtres et recherche */}
        <CategoryFilters
          searchTerm={filters.search}
          statusFilter={filters.status}
          onSearchChange={(value) => updateFilters({ search: value })}
          onStatusChange={(value) => updateFilters({ status: value })}
          onReset={resetFilters}
        />

        {/* Tableau des catégories */}
        <div className="admin-card overflow-hidden">
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
    </div>
  );
} 