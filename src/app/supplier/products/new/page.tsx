"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SupplierAddProductPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; }[]>([]);
  const [form, setForm] = useState({
    name: "",
    image: null as File | null,
    imagePreview: "",
    shortDesc: "",
    longDesc: "",
    price: "",
    categoryId: "",
    quantity: "",
    variants: [] as { name: string; value: string }[],
    variantName: "",
    variantValue: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Charger les catégories dynamiquement
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }));
    setError("");
  };

  const handleAddVariant = () => {
    if (!form.variantName || !form.variantValue) return;
    setForm(f => ({
      ...f,
      variants: [...f.variants, { name: f.variantName, value: f.variantValue }],
      variantName: "",
      variantValue: ""
    }));
  };

  const handleRemoveVariant = (idx: number) => {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!form.name || !form.price || !form.categoryId || !form.shortDesc) {
        setError("Veuillez remplir tous les champs obligatoires.");
        setLoading(false);
        return;
      }
      // Upload image si présente
      let imageUrl = "";
      if (form.image) {
        const data = new FormData();
        data.append("file", form.image);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const img = await res.json();
        if (!res.ok) throw new Error(img.error || "Erreur upload image");
        imageUrl = img.url;
      }
      // Création produit
      const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
      const res = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          imageUrl,
          shortDesc: form.shortDesc,
          longDesc: form.longDesc,
          price: form.price,
          categoryId: form.categoryId,
          quantity: form.quantity,
          variants: form.variants,
          supplierId,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur création produit");
      setSuccess("Produit ajouté avec succès !");
      setForm({
        name: "",
        image: null,
        imagePreview: "",
        shortDesc: "",
        longDesc: "",
        price: "",
        categoryId: "",
        quantity: "",
        variants: [],
        variantName: "",
        variantValue: ""
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => router.push("/supplier/products"), 1200);
    } catch (err: any) {
      setError(err.message || "Erreur technique");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-amber-600">Ajouter un produit</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">{success}</div>}
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Nom du produit *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Photo principale *</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="w-full border rounded-full px-4 py-2 bg-white"
            />
            {form.imagePreview && (
              <img src={form.imagePreview} alt="Prévisualisation" className="mt-2 w-32 h-32 object-cover rounded-xl border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Description courte *</label>
            <input
              type="text"
              name="shortDesc"
              value={form.shortDesc}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Description détaillée</label>
            <textarea
              name="longDesc"
              value={form.longDesc}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none min-h-[80px]"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1 text-amber-700">Prix fournisseur (FCFA) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                required
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1 text-amber-700">Quantité disponible</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Catégorie *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat: { id: string; name: string; slug: string }) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Variantes dynamiques */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Variantes (facultatif)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nom (ex: Taille, Couleur)"
                value={form.variantName}
                onChange={e => setForm(f => ({ ...f, variantName: e.target.value }))}
                className="border rounded-full px-3 py-2 flex-1 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
              <input
                type="text"
                placeholder="Valeur (ex: M, Bleu, 128Go)"
                value={form.variantValue}
                onChange={e => setForm(f => ({ ...f, variantValue: e.target.value }))}
                className="border rounded-full px-3 py-2 flex-1 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
              <button type="button" onClick={handleAddVariant} className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 font-bold">+</button>
            </div>
            {form.variants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.variants.map((v, idx) => (
                  <span key={idx} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-2">
                    {v.name}: {v.value}
                    <button type="button" onClick={() => handleRemoveVariant(idx)} className="ml-1 text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Ajout..." : "Soumettre"}
          </button>
        </form>
      </div>
    </div>
  );
} 