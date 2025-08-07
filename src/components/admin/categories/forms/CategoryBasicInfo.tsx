"use client";

import FormField from "./FormField";
import { IKUpload } from "imagekitio-react";
import { Image, Upload, X } from "lucide-react";
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
          className="admin-input"
          placeholder="Ex: Vêtements Femme, Chaussures Homme, Accessoires..."
        />
      </FormField>

      {/* Slug */}
      <FormField
        label="Slug (URL)"
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
          className="admin-input"
          placeholder="Ex: vetements-femme, chaussures-homme, accessoires..."
        />
        <p className="text-xs text-gray-500 mt-1 antialiased">
          Utilisé dans l'URL de la catégorie. Utilisez des tirets pour séparer les mots.
        </p>
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
          className="admin-input"
          placeholder="Décrivez cette catégorie de vêtements : styles, occasions, public cible..."
        />
        <p className="text-xs text-gray-500 mt-1 antialiased">
          Cette description apparaîtra sur la page de la catégorie pour aider vos clients.
        </p>
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
          className="w-full border border-gray-300 rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2 antialiased">
          Image représentative de la catégorie (optionnelle). Recommandé : 400x300px minimum.
        </p>
      </FormField>
    </div>
  );
}