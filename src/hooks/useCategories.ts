"use client";

import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isPublic: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les filtres
interface CategoryFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

// Hook personnalisé pour gérer les catégories
export function useCategories() {
  // États pour la gestion des données
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    status: "all",
  });

  // États pour la suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Chargement initial des catégories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors du chargement des catégories");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des filtres
  const updateFilters = (newFilters: Partial<CategoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  // Logique de suppression
  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Catégorie supprimée avec succès');
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        closeDeleteModal();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur de connexion lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtrage des catégories pour l'affichage
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         category.slug.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesStatus = filters.status === "all" || 
                         (filters.status === "active" && category.isActive) ||
                         (filters.status === "inactive" && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Création d'une nouvelle catégorie
  const createCategory = async (categoryData: Omit<Category, "id" | "productCount" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(prev => [data.category, ...prev]);
        return { success: true, category: data.category };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  // Modification d'une catégorie
  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(prev => prev.map(cat => 
          cat.id === id ? { ...cat, ...data.category } : cat
        ));
        return { success: true, category: data.category };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  return {
    // États
    categories: filteredCategories,
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
    createCategory,
    updateCategory,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
} 