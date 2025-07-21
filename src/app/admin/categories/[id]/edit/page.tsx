"use client";

import { useParams } from "next/navigation";
import {
  CategoryFormSection,
  CategoryBasicInfo,
  CategoryOptions,
  FormActions,
  PageHeader,
} from "@/components/admin/categories/forms";
import { useCategoryForm } from "@/hooks/useCategoryForm";
import CategorySectionsManager from "@/components/admin/categories/CategorySectionsManager";

// Page de modification d'une catégorie
export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handleImageUpload,
    handleImageRemove,
    handleSubmit,
  } = useCategoryForm(categoryId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* En-tête de la page */}
      <PageHeader
        title="Modifier la Catégorie"
        subtitle="Modifiez les informations de cette catégorie"
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
        <CategoryFormSection title="Actions">
          <FormActions
            loading={loading}
            cancelHref="/admin/categories"
            error={errors.general}
          />
        </CategoryFormSection>
      </form>
      <CategorySectionsManager categoryId={categoryId} />
    </div>
  );
} 