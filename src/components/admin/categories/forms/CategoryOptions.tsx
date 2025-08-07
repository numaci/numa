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
    <div className="space-y-6">
      {/* Catégorie active */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onInputChange}
          className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded mt-0.5"
        />
        <div>
          <label htmlFor="isActive" className="block text-sm font-medium text-gray-900 antialiased">
            Catégorie active
          </label>
          <p className="text-xs text-gray-600 mt-1 antialiased">
            Cette catégorie sera visible dans votre boutique en ligne
          </p>
        </div>
      </div>

      {/* Informations spécifiques boutique de vêtements */}
      <div className="admin-card bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 antialiased">💡 Conseils pour votre boutique de vêtements</h4>
        <ul className="text-sm text-gray-700 space-y-2 antialiased">
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Organisez vos catégories par <strong>type</strong> (T-shirts, Robes, Pantalons) ou par <strong>genre</strong> (Homme, Femme, Enfant)</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Créez des sous-catégories saisonnières : <em>Collection Été, Collection Hiver</em></span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Une catégorie désactivée reste accessible via URL directe mais n'apparaît plus dans les menus</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Les produits restent visibles même si leur catégorie est désactivée</span>
          </li>
        </ul>
      </div>
    </div>
  );
}