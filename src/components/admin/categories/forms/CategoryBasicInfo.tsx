"use client";

import FormField from "./FormField";
import { ImageUpload } from "@/components/ui/ImageUpload";

// Types pour les props du composant
interface CategoryBasicInfoProps {
  formData: {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
  };
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

// Composant pour les informations de base de la catégorie
export default function CategoryBasicInfo({
  formData,
  errors,
  onInputChange,
  onImageUpload,
  onImageRemove,
}: CategoryBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Nom de la catégorie */}
      <FormField
        label="Nom de la catégorie"
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300 ${
            errors.name ? "border-red-500" : "border-orange-300"
          }`}
          placeholder="Ex: Électronique"
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300 ${
            errors.slug ? "border-red-500" : "border-orange-300"
          }`}
          placeholder="Ex: electronique"
        />
      </FormField>

      {/* Description */}
      <FormField
        label="Description"
        name="description"
      >
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
          placeholder="Description de la catégorie..."
        />
      </FormField>

      {/* Image de la catégorie */}
      <FormField
        label="Image de la catégorie"
        name="imageUrl"
        error={errors.imageUrl}
      >
        <ImageUpload
          onUpload={onImageUpload}
          onRemove={onImageRemove}
          currentImage={formData.imageUrl}
          folder="categories"
          className="w-full border border-orange-300 rounded-lg"
        />
        <p className="text-sm text-orange-400 mt-2">
          L'image est optionnelle. Elle sera utilisée pour représenter la catégorie dans le catalogue.
        </p>
      </FormField>
    </div>
  );
} 