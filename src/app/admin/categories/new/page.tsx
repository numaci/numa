"use client";

import {
  CategoryFormSection,
  CategoryBasicInfo,
  CategoryOptions,
  FormActions,
  PageHeader,
} from "@/components/admin/categories/forms";
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
    <div className="max-w-2xl mx-auto p-6">
      {/* En-tête de la page */}
      <PageHeader
        title="Nouvelle Catégorie"
        subtitle="Ajoutez une nouvelle catégorie à votre catalogue"
        backHref="/admin/categories"
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
  );
} 