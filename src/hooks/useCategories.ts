"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

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
  // const router = useRouter();
  
  // États pour la gestion des données
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    status: "all",
  });

  // Chargement des catégories
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
      setError("Erreur de connexion");
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
    setFilters({
      search: "",
      status: "all",
    });
  };

  // Filtrage des catégories
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
        // Ajouter la nouvelle catégorie à la liste
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
        // Mettre à jour la catégorie dans la liste
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
    
    // Actions
    fetchCategories,
    updateFilters,
    resetFilters,
    createCategory,
    updateCategory,
  };
} 