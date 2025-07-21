"use client";

import FormField from "./FormField";

// Types pour les catégories
interface Category {
  id: string;
  name: string;
}

// Types pour les props du composant
interface ProductBasicInfoProps {
  formData: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    sku: string;
  };
  categories: Category[];
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Composant pour les informations de base du produit
export default function ProductBasicInfo({
  formData,
  categories,
  errors,
  onInputChange,
}: ProductBasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom du produit */}
        <FormField
          label="Nom du produit"
          name="name"
          error={errors.name}
          required
        >
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ex: iPhone 14 Pro"
          />
        </FormField>

        {/* Slug */}
        <FormField
          label="Slug"
          name="slug"
          error={errors.slug}
          required
        >
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.slug ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ex: iphone-14-pro"
          />
        </FormField>

        {/* Catégorie */}
        <FormField
          label="Catégorie"
          name="categoryId"
          error={errors.categoryId}
          required
        >
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.categoryId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* SKU */}
        <FormField
          label="SKU"
          name="sku"
        >
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: IPH14PRO-128GB"
          />
        </FormField>
      </div>

      {/* Description */}
      <div className="mt-6">
        <FormField
          label="Description"
          name="description"
          error={errors.description}
          required
        >
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Description détaillée du produit..."
          />
        </FormField>
      </div>
    </>
  );
} 