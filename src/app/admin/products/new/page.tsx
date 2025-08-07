"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";


// Types explicites
interface Category {
  id: string;
  name: string;
}

interface Variant {
  name: string;
  value: string;
  price: string;
  stock?: number;
}



interface ProductForm {
  name: string;
  category: string;
  description: string;
  image: File | string;
  images: string[];
  stock: string;
  price: string;
  comparePrice?: string;
  shippingPrice: string;
  isFreeShipping: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isBest: boolean;
  variants: Variant[];


  imageUrl: string; // Ajout de imageUrl
}

export default function NewProductPage() {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "",
    description: "",
    image: "",
    images: [],
    stock: "",
    price: "",
    comparePrice: "",
    shippingPrice: "",
    isFreeShipping: false,
    isActive: false,
    isFeatured: false,
    isBest: false,
    variants: [],
    
    imageUrl: "", // Initialisation de imageUrl
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [variant, setVariant] = useState<Variant>({ name: "", value: "", price: "" });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagesPreview, setImagesPreview] = useState<string[]>([]); // pour les multiples images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // Fetch dynamique des catégories depuis l'API
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.categories)) setCategories(data.categories);
        else if (Array.isArray(data)) setCategories(data);
      });

  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    if (type === "checkbox" && "checked" in e.target) {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => {
        const updated = { ...prev, [name]: checked };
        if (name === "isFreeShipping" && checked) {
          updated.shippingPrice = "0";
        }
        return updated;
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Échec de l'upload de l'image.");
      }

      const { filePath } = await res.json();
      setForm(prev => ({ ...prev, imageUrl: filePath }));
      setImagePreview(filePath);

    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload de l'image.");
    } finally {
      setLoading(false);
    }
  };

  // Gestion des images multiples
  const handleImagesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    files.forEach(file => {
      formData.append("file", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Échec de l'upload des images.");
      }

      const { urls } = await res.json();
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      setImagesPreview(prev => [...prev, ...urls]);

    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload des images.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    if (!variant.name || !variant.value || !variant.price) return;
    setForm({ ...form, variants: [...form.variants, { ...variant }] });
    setVariant({ name: "", value: "", price: "" });
  };
  const handleRemoveVariant = (idx: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // 1. On ne gère plus de File pour l'image principale, juste l'URL
      const imageUrl = form.imageUrl || "";
      let imagesUrls: string[] = [];
      // Upload images multiples si présentes
      if (form.images && form.images.length > 0) {
        imagesUrls = form.images;
      }
      // 2. Générer le slug automatiquement
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      // 3. Envoyer le produit à l'API
      const productRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug,
          description: form.description,
          price: form.price !== undefined && form.price !== "" ? Number(form.price) : undefined,
          comparePrice: form.comparePrice,
          stock: form.stock,
          categoryId: form.category,
          imageUrl,
          images: imagesUrls, // on envoie uniquement les URLs valides
          shippingPrice: form.shippingPrice,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          isBest: form.isBest,
          variants: form.variants,
        }),
      });
      if (!productRes.ok) {
        const err = await productRes.json();
        setError(err.error || "Erreur lors de l'ajout du produit");
        setLoading(false);
        return;
      }
      setSuccess("Produit ajouté !");
      setForm({
        name: "",
        category: "",
        description: "",
        imageUrl: "",
        image: "",
        images: [],
        stock: "",
        price: "",
        comparePrice: "",
        shippingPrice: "",
        isFreeShipping: false,
        isActive: false,
        isFeatured: false,
        isBest: false,
        variants: [],
      });
      setImagePreview("");
      setImagesPreview([]);
    } catch (err) {
      setError("Erreur lors de l'ajout du produit");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="admin-card">
          <h1 className="text-3xl font-semibold tracking-tight antialiased text-black mb-2">Ajouter un produit</h1>
          <p className="text-gray-600 antialiased mb-6">Remplissez les informations du produit à ajouter au catalogue</p>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Nom du produit</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="admin-input" required />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange} className="admin-input" required>
                <option value="">Choisir...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>


          </div>
          <div>
            <label className="block font-semibold mb-2 text-black antialiased">Description</label>
            <textarea name="description" value={form.description} onChange={handleTextareaChange} className="admin-input" rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Image principale</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="admin-input" />
                            {imagePreview && (
                <img
                  src={imagePreview}
                  width={128}
                  height={128}
                  alt="Aperçu du produit"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Autres images (plusieurs possibles)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="admin-input" />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(form.images) && form.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`img-${idx}`}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx)
                      }))}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                      title="Supprimer cette image"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="admin-input" min="0" required />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Prix principal (FCFA)</label>
              <input type="number" name="price" value={form.price || ""} onChange={handleChange} className="admin-input" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-black antialiased">Prix comparé (FCFA, optionnel)</label>
              <input type="number" name="comparePrice" value={form.comparePrice || ""} onChange={handleChange} className="admin-input" min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-3 text-black antialiased">Tailles disponibles</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', '46'].map((size) => {
                const sizeVariant = form.variants.find(v => v.value === size);
                const isSelected = !!sizeVariant;
                
                return (
                  <div key={size} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm(prev => ({
                                ...prev,
                                variants: [...prev.variants, { name: 'Taille', value: size, price: (prev.price || '0').toString(), stock: 0 }]
                              }));
                            } else {
                              setForm(prev => ({
                                ...prev,
                                variants: prev.variants.filter(v => v.value !== size)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                        />
                        <span className="font-semibold text-black antialiased">{size}</span>
                      </label>
                    </div>
                    
                    {isSelected && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1 antialiased">Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={sizeVariant?.stock || 0}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              setForm(prev => ({
                                ...prev,
                                variants: prev.variants.map(v => 
                                  v.value === size ? { ...v, stock: newStock } : v
                                )
                              }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1 antialiased">Prix (FCFA)</label>
                          <input
                            type="number"
                            min="0"
                            value={sizeVariant?.price || form.price || '0'}
                            onChange={(e) => {
                              const newPrice = (parseFloat(e.target.value) || 0).toString();
                              setForm(prev => ({
                                ...prev,
                                variants: prev.variants.map(v => 
                                  v.value === size ? { ...v, price: newPrice } : v
                                )
                              }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder={form.price?.toString() || '0'}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {form.variants.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-black mb-2 antialiased">Résumé des tailles sélectionnées :</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                  {form.variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white rounded px-2 py-1 border border-gray-200">
                      <span className="font-medium text-black antialiased">{v.value}</span>
                      <span className="text-gray-600 antialiased">{v.stock} unités</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600 antialiased">
                  <strong>Stock total :</strong> {form.variants.reduce((sum, v) => sum + (v.stock || 0), 0)} unités
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black antialiased">Prix de livraison (FCFA)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="shippingPrice"
                value={form.shippingPrice}
                onChange={handleChange}
                className="admin-input w-32"
                min="0"
                disabled={form.isFreeShipping}
              />
              <label className="flex items-center gap-2 text-black antialiased">
                <input
                  type="checkbox"
                  name="isFreeShipping"
                  checked={form.isFreeShipping}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-gray-300 border-gray-300 rounded"
                />
                Livraison gratuite
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-5 w-5 text-orange-500 focus:ring-orange-400 border-orange-200 rounded-xl transition" />
              Produit actif (visible dans le catalogue)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="h-5 w-5 text-orange-500 focus:ring-orange-400 border-orange-200 rounded-xl transition" />
              Produit en vedette (affiché sur la page d'accueil)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isBest" checked={form.isBest} onChange={handleChange} className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-amber-200 rounded-xl transition" />
              Afficher dans « Nos meilleures produits » (/products)
            </label>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-black mb-2 antialiased">Informations</h4>
            <ul className="text-sm text-gray-700 space-y-1 antialiased">
              <li>• Un produit inactif ne sera pas visible dans le catalogue</li>
              <li>• Un produit en vedette apparaîtra en premier sur la page d'accueil</li>
              <li>• Vous pouvez modifier ces options à tout moment</li>
            </ul>
          </div>
          {error && <div className="text-red-600 text-center font-semibold antialiased mt-4">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold antialiased mt-4">{success}</div>}
          <button type="submit" className="admin-button admin-button-primary w-full disabled:opacity-50" disabled={loading}>{loading ? "Ajout..." : "Ajouter le produit"}</button>
        </form>
        </div>
      </div>
    </div>
  );
} 