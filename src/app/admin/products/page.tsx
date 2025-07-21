"use client";

import {
  ProductFilters,
  ProductTable,
  Pagination,
  DeleteModal,
  LoadingState,
  ErrorState,
  PageHeader,
} from "@/components/admin/products";
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
    <div className="flex flex-col gap-6 overflow-visible">
      {/* En-tête de la page */}
      <PageHeader
        title="Gestion des produits"
        subtitle="Gérez votre catalogue de produits"
        actionLabel="Nouveau produit"
        actionHref="/admin/products/new"
      />

      <div className="mb-4 flex justify-end">
        <Link href="/admin/products/pending" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-semibold transition">Valider les produits en attente</Link>
      </div>

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
      <div className="bg-white rounded-lg shadow-sm border overflow-visible z-0">
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