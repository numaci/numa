"use client";

import {
  CategoryFormSection,
  CategoryBasicInfo,
  CategoryOptions,
  FormActions,
} from "@/components/admin/categories/forms";
import PageHeader from "@/components/admin/PageHeader";
import { useCategoryForm } from "@/hooks/useCategoryForm";

// Page de création d'une nouvelle catégorie
export default function NewCategoryPage() {
  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handleImageUpload,
    handleImageRemove,
    handleSubmit,
  } = useCategoryForm();

  return (
    <div className="bg-white min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête de la page */}
        <PageHeader 
          title="Nouvelle catégorie"
          subtitle="Ajoutez une nouvelle catégorie à votre catalogue de produits"
        />

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <CategoryFormSection title="Informations de base">
            <CategoryBasicInfo
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
          </CategoryFormSection>

          {/* Options */}
          <CategoryFormSection title="Options">
            <CategoryOptions
              formData={formData}
              onInputChange={handleInputChange}
            />
          </CategoryFormSection>

          {/* Actions */}
          <CategoryFormSection title="">
            <FormActions
              loading={loading}
              cancelHref="/admin/categories"
              error={errors.general}
            />
          </CategoryFormSection>
        </form>
      </div>
    </div>
  );
} 