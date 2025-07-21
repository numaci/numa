"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { upload as imagekitUpload } from "@imagekit/next";
import { Image, ImageKitProvider } from "@imagekit/next";

// Types explicites
interface Category {
  id: string;
  name: string;
}

interface Variant {
  name: string;
  value: string;
  price: string;
}

interface Supplier {
  id: string;
  name: string;
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
  supplier: string;
  supplierPrice: string;
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
    supplier: "",
    supplierPrice: "",
    imageUrl: "", // Initialisation de imageUrl
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [variant, setVariant] = useState<Variant>({ name: "", value: "", price: "" });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagesPreview, setImagesPreview] = useState<string[]>([]); // pour les multiples images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch dynamique des catégories depuis l'API
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.categories)) setCategories(data.categories);
        else if (Array.isArray(data)) setCategories(data);
      });
    fetch("/api/admin/suppliers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
        else if (Array.isArray(data)) setSuppliers(data);
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
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Upload direct sur ImageKit
      const res = await fetch("/api/upload-auth");
      if (!res.ok) {
        setError("Erreur d'authentification ImageKit");
        return;
      }
      const { signature, expire, token, publicKey } = await res.json();
      try {
        const uploadResponse = await imagekitUpload({
          file,
          fileName: file.name,
          token,
          signature,
          expire,
          publicKey,
          folder: "/products",
        });
        // On stocke l'URL http dans imageUrl
        setForm(prev => ({ ...prev, imageUrl: uploadResponse.url || "" }));
        setImagePreview(uploadResponse.url || "");
      } catch (err) {
        setError("Erreur lors de l'upload sur ImageKit");
      }
    }
  };

  // Gestion des images multiples (ImageKit)
  const handleImagesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const res = await fetch("/api/upload-auth");
    if (!res.ok) {
      setError("Erreur d'authentification ImageKit");
      return;
    }
    const { signature, expire, token, publicKey } = await res.json();
    try {
      // Upload chaque image sur ImageKit
      const uploadPromises = files.map(file =>
        imagekitUpload({
          file,
          fileName: file.name,
          token,
          signature,
          expire,
          publicKey,
          folder: "/products",
        })
      );
      const uploadResponses = await Promise.all(uploadPromises);
      const urls = uploadResponses.map(r => r.url).filter(Boolean);
      // Pour la création, on ne concatène pas, on remplace !
      setForm(prev => ({
        ...prev,
        images: urls.filter((i): i is string => typeof i === 'string' && i.startsWith('http'))
      }));
      setImagesPreview(urls.filter((i): i is string => typeof i === 'string' && i.startsWith('http')));
    } catch (err) {
      setError("Erreur lors de l'upload sur ImageKit");
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
        // On ne prend que les URLs valides (pas de blob)
        imagesUrls = form.images.filter(i => typeof i === 'string' && i.startsWith('http'));
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
          supplierId: form.supplier,
          supplierPrice: form.supplierPrice !== undefined && form.supplierPrice !== "" ? Number(form.supplierPrice) : undefined,
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
        supplier: "",
        supplierPrice: "",
      });
      setImagePreview("");
      setImagesPreview([]);
    } catch (err) {
      setError("Erreur lors de l'ajout du produit");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <h1 className="text-3xl font-extrabold text-orange-600 mb-2 text-center">Ajouter un produit</h1>
        <p className="text-orange-900 text-center mb-8">Remplissez les informations du produit à ajouter au catalogue</p>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Nom du produit</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 shadow" required>
                <option value="">Choisir...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Fournisseur</label>
              <select name="supplier" value={form.supplier} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 shadow" required>
                <option value="">Choisir...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Prix fournisseur (FCFA)</label>
              <input
                type="number"
                name="supplierPrice"
                value={form.supplierPrice}
                onChange={handleChange}
                className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-orange-900">Description</label>
            <textarea name="description" value={form.description} onChange={handleTextareaChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow" rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Image principale</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-orange-200 rounded-xl p-2 bg-white/90 text-orange-900 shadow" />
              {form.imageUrl && form.imageUrl.startsWith('http') && (
                <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}>
                  <Image
                    src={form.imageUrl}
                    width={128}
                    height={128}
                    alt="Aperçu du produit"
                    className="mt-2 w-32 h-32 object-cover rounded-xl border border-orange-200 shadow"
                  />
                </ImageKitProvider>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Autres images (plusieurs possibles)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="w-full border border-orange-200 rounded-xl p-2 bg-white/90 text-orange-900 shadow" />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(form.images) && form.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={typeof img === "string" ? img : URL.createObjectURL(img)}
                      alt={`img-${idx}`}
                      className="w-16 h-16 object-cover rounded-xl border border-orange-200 shadow"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow" min="0" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Prix principal (FCFA)</label>
              <input type="number" name="price" value={form.price || ""} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-orange-900">Prix comparé (FCFA, optionnel)</label>
              <input type="number" name="comparePrice" value={form.comparePrice || ""} onChange={handleChange} className="w-full border border-orange-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/90 text-orange-900 placeholder-orange-300 shadow" min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-orange-900">Variantes (option, valeur, prix)</label>
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <input type="text" placeholder="Option (ex: Capacité, Taille)" value={variant.name} onChange={e => setVariant({ ...variant, name: e.target.value })} className="border border-orange-200 rounded-xl p-2 flex-1 bg-white/90 text-orange-900 shadow" />
              <input type="text" placeholder="Valeur (ex: 128Go, XL)" value={variant.value} onChange={e => setVariant({ ...variant, value: e.target.value })} className="border border-orange-200 rounded-xl p-2 flex-1 bg-white/90 text-orange-900 shadow" />
              <input type="number" placeholder="Prix (FCFA)" value={variant.price} onChange={e => setVariant({ ...variant, price: e.target.value })} className="border border-orange-200 rounded-xl p-2 w-28 bg-white/90 text-orange-900 shadow" min="0" />
              <button type="button" onClick={handleAddVariant} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl font-bold shadow transition">Ajouter</button>
            </div>
            {form.variants.length > 0 && (
              <ul className="mb-2">
                {form.variants.map((v, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm mb-1 bg-orange-50 rounded-xl px-3 py-1 shadow border border-orange-100">
                    <span className="font-semibold text-orange-900">{v.name}:</span> <span>{v.value}</span> <span className="text-orange-700">{v.price} FCFA</span>
                    <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 hover:underline ml-2">Supprimer</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1 text-orange-900">Prix de livraison (FCFA)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="shippingPrice"
                value={form.shippingPrice}
                onChange={handleChange}
                className="border border-orange-200 rounded-xl p-2 w-32 bg-white/90 text-orange-900 shadow"
                min="0"
                disabled={form.isFreeShipping}
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="isFreeShipping"
                  checked={form.isFreeShipping}
                  onChange={handleChange}
                />
                Livraison gratuite
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
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
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 rounded-2xl text-lg shadow-lg transition disabled:opacity-50" disabled={loading}>{loading ? "Ajout..." : "Ajouter le produit"}</button>
        </form>
      </div>
    </div>
  );
} 