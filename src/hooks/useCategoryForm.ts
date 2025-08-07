"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types pour le formulaire de catégorie
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

// Hook personnalisé pour gérer le formulaire de catégorie
export function useCategoryForm(categoryId?: string) {
  const router = useRouter();
  
  // États pour la gestion du formulaire
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!categoryId);
    const [errors, setErrors] = useState<Record<string, string>>({});

  // Gestion de l'upload d'image
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    // Effacer l'erreur d'image s'il y en a une
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: "" }));
    }
  };

  // Gestion de la suppression d'image
  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };



  // Chargement de la catégorie existante si on est en mode édition
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Génération automatique du slug à partir du nom
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[éèê]/g, "e")
        .replace(/[àâ]/g, "a")
        .replace(/[ùû]/g, "u")
        .replace(/[ôö]/g, "o")
        .replace(/[îï]/g, "i")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Récupération d'une catégorie existante
  const fetchCategory = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.category.name,
          slug: data.category.slug,
          description: data.category.description || "",
          imageUrl: data.category.imageUrl || "",
          isActive: data.category.isActive,
        });
      } else {
        setErrors(prev => ({ ...prev, general: "Catégorie non trouvée" }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la catégorie:", error);
      setErrors(prev => ({ ...prev, general: "Erreur lors du chargement de la catégorie" }));
    } finally {
      setInitialLoading(false);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };



  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de la catégorie est requis";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, general: "" }));
    
    try {
      const url = categoryId 
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";
      
      const method = categoryId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(prev => ({ ...prev, general: errorData.error || "Erreur lors de la sauvegarde" }));
        return;
      }

      // Redirection vers la liste des catégories
      router.push("/admin/categories");
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setErrors(prev => ({ ...prev, general: "Erreur de connexion. Veuillez réessayer." }));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading: loading || initialLoading,
    errors,
    handleInputChange,
    handleImageUpload,
    handleImageRemove,
    handleSubmit,
  };
} 