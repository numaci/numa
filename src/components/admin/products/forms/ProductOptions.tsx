"use client";

import React from "react";
import { useState } from "react";

const CLOTHING_SIZES = ["S", "M", "L", "XL"];
const PHONE_STORAGES = ["32Go", "64Go", "128Go"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];
const COLORS = ["Noir", "Blanc", "Rouge", "Bleu", "Vert"];

interface Category {
  id: string;
  name: string;
}

interface ProductOptionsProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<any>) => void;
  onAttributesChange?: (attributes: any) => void;
  categories: Category[];
}

// Composant pour les options du produit
export default function ProductOptions({
  formData,
  onInputChange,
  onAttributesChange,
  categories,
}: ProductOptionsProps) {
  // Trouver le nom de la catégorie à partir de l'id
  const category = categories.find((cat) => cat.id === formData.categoryId)?.name;

  // Gestion des attributs dynamiques
  const handleAttributeChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, options, checked } = e.target;
    let newValue: any = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "select-multiple") {
      newValue = Array.from(options).filter((o: any) => o.selected).map((o: any) => o.value);
    }
    const updated = { ...formData.attributes, [name]: newValue };
    if (onAttributesChange) onAttributesChange(updated);
  };

  // Gestion des variantes dynamiques
  const [variantName, setVariantName] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const variants = formData.variants || [];
  const handleAddVariant = () => {
    if (!variantName || !variantValue) return;
    const newVariants = [...variants, { name: variantName, value: variantValue }];
    if (onInputChange) onInputChange({ target: { name: "variants", value: newVariants } });
    setVariantName("");
    setVariantValue("");
  };
  const handleRemoveVariant = (idx: number) => {
    const newVariants = variants.filter((_: any, i: number) => i !== idx);
    if (onInputChange) onInputChange({ target: { name: "variants", value: newVariants } });
  };
  // Gestion du prix de livraison
  const shippingPrice = formData.shippingPrice ?? "";
  const isFreeShipping = shippingPrice === 0 || shippingPrice === "0";
  const handleShippingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };
  const handleFreeShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onInputChange({ target: { name: "shippingPrice", value: 0 } });
    }
  };

  return (
    <div className="space-y-4">
      {/* Options dynamiques selon la catégorie */}
      {category === "Vêtements" && (
        <>
          <label className="block font-semibold">Tailles disponibles</label>
          <select multiple name="sizes" value={formData.attributes?.sizes || []} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            {CLOTHING_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <label className="block font-semibold mt-2">Couleurs</label>
          <select multiple name="colors" value={formData.attributes?.colors || []} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            {COLORS.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </>
      )}
      {category === "Téléphones" && (
        <>
          <label className="block font-semibold">Stockage</label>
          <select name="storage" value={formData.attributes?.storage || ""} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            <option value="">Choisir</option>
            {PHONE_STORAGES.map((storage) => (
              <option key={storage} value={storage}>{storage}</option>
            ))}
          </select>
          <label className="block font-semibold mt-2">Couleurs</label>
          <select multiple name="colors" value={formData.attributes?.colors || []} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            {COLORS.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <label className="block font-semibold mt-2">État</label>
          <select name="condition" value={formData.attributes?.condition || ""} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            <option value="">Choisir</option>
            <option value="neuf">Neuf</option>
            <option value="occasion">Occasion</option>
          </select>
        </>
      )}
      {category === "Chaussures" && (
        <>
          <label className="block font-semibold">Pointures disponibles</label>
          <select multiple name="sizes" value={formData.attributes?.sizes || []} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            {SHOE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <label className="block font-semibold mt-2">Couleurs</label>
          <select multiple name="colors" value={formData.attributes?.colors || []} onChange={handleAttributeChange} className="w-full border rounded-lg p-2">
            {COLORS.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </>
      )}
      {/* Champs génériques pour les autres catégories */}
      {!["Vêtements", "Téléphones", "Chaussures"].includes(category || "") && (
        <>
          <label className="block font-semibold">Attributs personnalisés</label>
          <input type="text" name="custom" value={formData.attributes?.custom || ""} onChange={handleAttributeChange} className="w-full border rounded-lg p-2" placeholder="Ex: Couleur, taille, etc." />
        </>
      )}

      {/* Variantes dynamiques */}
      <div className="mt-6">
        <label className="block font-semibold mb-1">Variantes (ex: taille, couleur, capacité...)</label>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Nom (ex: Couleur)" value={variantName} onChange={e => setVariantName(e.target.value)} className="border rounded p-2 flex-1" />
          <input type="text" placeholder="Valeur (ex: Rouge)" value={variantValue} onChange={e => setVariantValue(e.target.value)} className="border rounded p-2 flex-1" />
          <button type="button" onClick={handleAddVariant} className="bg-amber-500 text-white px-3 py-2 rounded font-bold">Ajouter</button>
        </div>
        {variants.length > 0 && (
          <ul className="mb-2">
            {variants.map((v: any, idx: number) => (
              <li key={idx} className="flex items-center gap-2 text-sm mb-1">
                <span className="font-semibold">{v.name}:</span> <span>{v.value}</span>
                <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 hover:underline ml-2">Supprimer</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Prix de livraison */}
      <div className="mt-6">
        <label className="block font-semibold mb-1">Prix de livraison (FCFA)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            name="shippingPrice"
            value={shippingPrice}
            onChange={handleShippingPriceChange}
            className="border rounded p-2 w-32"
            min="0"
            disabled={isFreeShipping}
          />
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={isFreeShipping} onChange={handleFreeShippingChange} />
            Livraison gratuite
          </label>
        </div>
      </div>

      {/* Options standards (actif, vedette) */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onInputChange}
          className="h-5 w-5 text-orange-500 focus:ring-orange-400 border-orange-200 rounded-xl transition"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-orange-900 font-semibold">
          Produit actif (visible dans le catalogue)
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isFeatured"
          name="isFeatured"
          checked={formData.isFeatured}
          onChange={onInputChange}
          className="h-5 w-5 text-orange-500 focus:ring-orange-400 border-orange-200 rounded-xl transition"
        />
        <label htmlFor="isFeatured" className="ml-2 block text-sm text-orange-900 font-semibold">
          Produit en vedette (affiché sur la page d'accueil)
        </label>
      </div>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="isBest"
          name="isBest"
          checked={formData.isBest || false}
          onChange={onInputChange}
          className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-amber-200 rounded-xl transition"
        />
        <label htmlFor="isBest" className="ml-2 block text-sm text-amber-900 font-semibold">
          Afficher dans « Nos meilleures produits » (/products)
        </label>
      </div>
      <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
        <h4 className="text-sm font-bold text-orange-800 mb-2">Informations</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Un produit inactif ne sera pas visible dans le catalogue</li>
          <li>• Un produit en vedette apparaîtra en premier sur la page d'accueil</li>
          <li>• Vous pouvez modifier ces options à tout moment</li>
        </ul>
      </div>
    </div>
  );
} 