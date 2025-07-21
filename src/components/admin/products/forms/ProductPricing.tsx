"use client";

import FormField from "./FormField";

// Types pour les props du composant
interface ProductPricingProps {
  formData: {
    price: string;
    comparePrice: string;
    stock: string;
    weight: string;
    dimensions: string;
  };
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Composant pour la section prix et stock
export default function ProductPricing({
  formData,
  errors,
  onInputChange,
}: ProductPricingProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prix principal */}
        <FormField
          label="Prix principal (FCFA)"
          name="price"
          error={errors.price}
          required
        >
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={onInputChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow ${
              errors.price ? "border-red-500" : "border-orange-200"
            }`}
            placeholder="0.00"
          />
        </FormField>

        {/* Prix comparé */}
        <FormField
          label="Prix comparé (FCFA)"
          name="comparePrice"
          error={errors.comparePrice}
        >
          <input
            type="number"
            id="comparePrice"
            name="comparePrice"
            value={formData.comparePrice}
            onChange={onInputChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow ${
              errors.comparePrice ? "border-red-500" : "border-orange-200"
            }`}
            placeholder="0.00"
          />
        </FormField>

        {/* Stock */}
        <FormField
          label="Stock"
          name="stock"
          error={errors.stock}
          required
        >
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={onInputChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow ${
              errors.stock ? "border-red-500" : "border-orange-200"
            }`}
            placeholder="0"
          />
        </FormField>
      </div>

      {/* Poids et dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FormField
          label="Poids (g)"
          name="weight"
        >
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={onInputChange}
            step="0.1"
            min="0"
            className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow"
            placeholder="0.0"
          />
        </FormField>

        <FormField
          label="Dimensions"
          name="dimensions"
        >
          <input
            type="text"
            id="dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow"
            placeholder="Ex: 10x5x2 cm"
          />
        </FormField>
      </div>
    </>
  );
} 