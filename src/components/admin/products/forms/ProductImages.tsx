"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import FormField from "./FormField";

// Types pour les props du composant
interface ProductImagesProps {
  imageUrl: string;
  onImageChange: (url: string, publicId: string) => void;
  onImageRemove?: () => void;
  error?: string;
}

// Composant pour la gestion des images avec Cloudinary
export default function ProductImages({
  imageUrl,
  onImageChange,
  onImageRemove,
  error,
}: ProductImagesProps) {
  return (
    <div className="space-y-4">
      {/* Image principale */}
      <FormField
        label="Image principale"
        name="imageUrl"
        error={error}
      >
        <ImageUpload
          onUpload={onImageChange}
          onRemove={onImageRemove}
          currentImage={imageUrl}
          folder="products"
          className="max-w-md rounded-xl border border-orange-200 bg-white/90 shadow"
        />
      </FormField>

      {/* Informations sur l'upload */}
      <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-xl border border-orange-100">
        <p className="font-bold text-orange-800 mb-1">Informations d'upload :</p>
        <ul className="space-y-1 text-orange-700">
          <li>• Formats acceptés : JPG, PNG, WebP, GIF</li>
          <li>• Taille maximale : 5 MB</li>
          <li>• Redimensionnement automatique à 800x800px</li>
          <li>• Optimisation automatique de la qualité</li>
        </ul>
      </div>
    </div>
  );
} 