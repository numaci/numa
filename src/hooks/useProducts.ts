import { useState, useEffect } from "react";

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
  images?: string[];
  category: {
    name: string;
  };
  createdAt: string;
}

// Types pour les catégories
interface Category {
  id: string;
  name: string;
}

// Types pour les filtres
interface ProductFilters {
  search: string;
  category: string;
  status: string;
}

// Types pour la pagination
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Hook personnalisé pour la gestion des produits
export function useProducts() {
  // États pour les données
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // États pour les filtres
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    status: "all",
  });

  // États pour les actions
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Récupération des produits
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        search: filters.search,
        category: filters.category,
        status: filters.status,
      });

      const response = await fetch(`/api/admin/products?${params}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const data = await response.json();
      setProducts(data.products);
      setPagination(prev => ({
        ...prev,
        totalItems: data.total,
        totalPages: Math.ceil(data.total / pagination.itemsPerPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
    }
  };

  // Suppression d'un produit
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recharger la liste des produits
        await fetchProducts();
        setDeleteModalOpen(false);
        setProductToDelete(null);
        return { success: true };
      } else {
        const data = await response.json();
        // Si le produit ne peut pas être supprimé à cause de commandes, on le désactive
        if (
          data?.error &&
          data.error.includes("Impossible de supprimer ce produit car il est utilisé dans des commandes")
        ) {
          // Désactiver le produit
          const putResponse = await fetch(`/api/admin/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          });
          if (putResponse.ok) {
            await fetchProducts();
            setDeleteModalOpen(false);
            setProductToDelete(null);
            setError("Le produit a été désactivé car il est utilisé dans des commandes.");
            return { success: true, deactivated: true };
          } else {
            setError("Erreur lors de la désactivation du produit.");
            return { success: false, error: "Erreur lors de la désactivation du produit." };
          }
        } else {
          setError(data?.error || "Erreur lors de la suppression");
          return { success: false, error: data?.error || "Erreur lors de la suppression" };
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Activation/désactivation d'un produit
  const toggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (response.ok) {
        await fetchProducts();
        return { success: true };
      } else {
        const data = await response.json();
        setError(data?.error || "Erreur lors du changement de statut");
        return { success: false, error: data?.error };
      }
    } catch (err) {
      setError("Erreur lors du changement de statut");
      return { success: false, error: "Erreur lors du changement de statut" };
    }
  };

  // Gestion des filtres
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Retour à la première page
  };

  // Gestion de la pagination
  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "all",
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Gestion de la modal de suppression
  const openDeleteModal = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
    }
  };

  // Chargement initial et rechargement lors des changements
  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, filters.search, filters.category, filters.status]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    // États
    products,
    categories,
    loading,
    error,
    pagination,
    filters,
    deleteModalOpen,
    productToDelete,

    // Actions
    fetchProducts,
    fetchCategories,
    deleteProduct,
    updateFilters,
    changePage,
    resetFilters,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    toggleProductActive,
  };
} 