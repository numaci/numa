"use client";

import {
  ProductFilters,
  ProductTable,
  Pagination,
  DeleteModal,
  LoadingState,
  ErrorState,
} from "@/components/admin/products";
import PageHeader from "@/components/admin/PageHeader";
import { useProducts } from "@/hooks/useProducts";
import Link from 'next/link';

// Page principale de gestion des produits
export default function ProductsPage() {
  const {
    // États
    products,
    categories,
    loading,
    error,
    pagination,
    filters,
    deleteModalOpen,
    
    // Actions
    fetchProducts,
    updateFilters,
    changePage,
    resetFilters,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    toggleProductActive,
  } = useProducts();

  return (
    <div className="bg-white min-h-screen space-y-6">
      {/* En-tête de la page */}
      <PageHeader 
        title="Gestion des produits"
        subtitle="Gérez votre catalogue de produits"
        actionLabel="Nouveau produit"
        actionHref="/admin/products/new"
      />

      {/* Filtres et recherche */}
      <ProductFilters
        searchTerm={filters.search}
        selectedCategory={filters.category}
        statusFilter={filters.status}
        categories={categories}
        onSearchChange={(value) => updateFilters({ search: value })}
        onCategoryChange={(value) => updateFilters({ category: value })}
        onStatusChange={(value) => updateFilters({ status: value })}
        onReset={resetFilters}
      />

      {/* Tableau des produits */}
      <div className="admin-card overflow-visible z-0">
        {loading ? (
          <LoadingState message="Chargement des produits..." />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchProducts} retryText="Réessayer" />
        ) : (
          <>
            <ProductTable
              products={products}
              onDelete={openDeleteModal}
              onToggleActive={toggleProductActive}
            />
            
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={changePage}
            />
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 