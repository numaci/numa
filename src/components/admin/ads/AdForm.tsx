import { useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";

export interface AdFormValues {
  title: string;
  description: string;
  buttonText: string;
  imageUrl?: string;
  link?: string;
  bgColor?: string;
  order: number;
  isActive: boolean;
  productId?: string;
  categoryId?: string;
}

export default function AdForm({
  initialValues,
  onSubmit,
  loading = false,
  products = [],
  categories = [],
}: {
  initialValues?: Partial<AdFormValues>;
  onSubmit: (values: AdFormValues) => void;
  loading?: boolean;
  products?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
}) {
  const [values, setValues] = useState<AdFormValues>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    buttonText: initialValues?.buttonText || "",
    imageUrl: initialValues?.imageUrl || "",
    link: initialValues?.link || "",
    bgColor: initialValues?.bgColor || "",
    order: initialValues?.order || 0,
    isActive: initialValues?.isActive ?? true,
    productId: initialValues?.productId || "",
    categoryId: initialValues?.categoryId || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...values,
      order: Number(values.order),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-bold text-orange-800 mb-1">Titre</label>
        <input name="title" value={values.title} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Description</label>
        <textarea name="description" value={values.description} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Texte du bouton</label>
        <input name="buttonText" value={values.buttonText} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
      </div>
      {/* Champ upload image */}
      <div>
        <label className="block font-bold text-orange-800 mb-1">Image</label>
        <ImageUpload
          onUpload={(url) => setValues((prev) => ({ ...prev, imageUrl: url }))}
          currentImage={values.imageUrl}
          onRemove={() => setValues((prev) => ({ ...prev, imageUrl: "" }))}
        />
      </div>
      {/* Champ texte imageUrl masqué si image uploadée */}
      {false && (
        <div>
          <label className="block font-bold text-orange-800 mb-1">Image (URL)</label>
          <input name="imageUrl" value={values.imageUrl} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
        </div>
      )}
      <div>
        <label className="block font-bold text-orange-800 mb-1">Numéro WhatsApp (pour la carte commande)</label>
        <input
          name="link"
          value={values.link}
          onChange={handleChange}
          className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
          placeholder="Ex: +223XXXXXXXXX"
        />
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Produit lié</label>
        <select name="productId" value={values.productId} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900">
          <option value="">Aucun</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Catégorie liée</label>
        <select name="categoryId" value={values.categoryId} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900">
          <option value="">Aucune</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Couleur de fond (hex ou nom CSS)</label>
        <input name="bgColor" value={values.bgColor} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
      </div>
      <div>
        <label className="block font-bold text-orange-800 mb-1">Ordre d'affichage</label>
        <input name="order" type="number" value={values.order} onChange={handleChange} className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300" />
      </div>
      <div className="flex items-center gap-2">
        <input name="isActive" type="checkbox" checked={values.isActive} onChange={handleChange} id="isActive" className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-orange-300 rounded" />
        <label htmlFor="isActive" className="text-orange-900 font-semibold">Active</label>
      </div>
      <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 transition-colors" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
} 