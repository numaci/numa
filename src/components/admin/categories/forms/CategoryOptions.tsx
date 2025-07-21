"use client";

// Types pour les props du composant
interface CategoryOptionsProps {
  formData: {
    isActive: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Composant pour les options de la catégorie
export default function CategoryOptions({
  formData,
  onInputChange,
}: CategoryOptionsProps) {
  return (
    <div className="space-y-4">
      {/* Catégorie active */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onInputChange}
          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-orange-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-orange-900 font-semibold">
          Catégorie active (visible dans le catalogue)
        </label>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <h4 className="text-sm font-bold text-orange-800 mb-2">Informations</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Une catégorie inactive ne sera pas visible dans le catalogue</li>
          <li>• Les produits de cette catégorie resteront visibles si la catégorie est désactivée</li>
          <li>• Vous pouvez modifier cette option à tout moment</li>
        </ul>
      </div>
    </div>
  );
} 