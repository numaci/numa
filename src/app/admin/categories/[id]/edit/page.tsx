"use client";

import { useParams } from "next/navigation";
import {
  CategoryFormSection,
  CategoryBasicInfo,
  CategoryOptions,
  FormActions,
} from "@/components/admin/categories/forms";
import PageHeader from "@/components/admin/PageHeader";
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
    <div className="bg-white min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête de la page */}
        <PageHeader 
          title="Modifier la catégorie"
          subtitle="Modifiez les informations et paramètres de cette catégorie"
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
    </div>
  );
} 