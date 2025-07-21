"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import { ProductOptions, ProductFormSection } from '@/components/admin/products/forms';
import { upload } from "@imagekit/next";

// Types pour les catégories
interface Category {
  id: string;
  name: string;
}

// Types pour le produit
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  images: string | null;
  variants?: { name: string; value: string }[];
  shippingPrice?: number | null;
}

// Types pour le formulaire de produit
interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  images: (string | File)[];
  stock: string;
  price: string;
  comparePrice: string;
  shippingPrice: string;
  isFreeShipping: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isBest: boolean;
  variants: { name: string; value: string; price: string }[];
}

// Page de modification d'un produit
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  // États pour la gestion du formulaire
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    categoryId: "",
    description: "",
    imageUrl: "",
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

  // États pour la gestion de l'interface
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Chargement des données au montage
  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  // Génération automatique du slug à partir du nom
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[éèê]/g, "e")
        .replace(/[àâ]/g, "a")
        .replace(/[ùû]/g, "u")
        .replace(/[ôö]/g, "o")
        .replace(/[îï]/g, "i")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Récupération du produit
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setProductNotFound(true);
          return;
        }
        throw new Error("Erreur lors du chargement du produit");
      }

      const product: Product = await response.json();
      
      // Conversion des données pour le formulaire
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        imageUrl: product.imageUrl || "",
        images: product.images ? JSON.parse(product.images) : [],
        stock: product.stock.toString(),
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() || "",
        shippingPrice: product.shippingPrice?.toString() || "",
        isFreeShipping: (product as any).isFreeShipping || false,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isBest: (product as any).isBest || false,
        variants: Array.isArray(product.variants)
          ? product.variants.map(v => ({
              name: v.name,
              value: v.value,
              price: (v as any).price?.toString() || ""
            }))
          : [],
      });
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        fetch: error instanceof Error ? error.message : "Erreur lors du chargement" 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === "isFreeShipping" && checked) {
        setFormData(prev => ({ ...prev, shippingPrice: "0" }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du produit est requis";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "La catégorie est requise";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = "L'image principale est requise";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Le stock doit être supérieur ou égal à 0";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
    }

    if (formData.comparePrice && parseFloat(formData.comparePrice) <= parseFloat(formData.price)) {
      newErrors.comparePrice = "Le prix comparé doit être supérieur au prix principal";
    }

    // if (formData.variants.length === 0) {
    //   newErrors.variants = "Au moins une variante est requise";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload d'image principale (ImageKit)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Appel à l'API pour obtenir les credentials ImageKit
      const res = await fetch("/api/upload-auth");
      if (!res.ok) {
        setErrors(prev => ({ ...prev, imageUrl: "Erreur d'authentification ImageKit" }));
        return;
      }
      const { signature, expire, token, publicKey } = await res.json();
      // Upload sur ImageKit
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        token,
        signature,
        expire,
        publicKey,
        folder: "/products",
      });
      // On récupère l'URL http distante
      setFormData(prev => ({ ...prev, imageUrl: uploadResponse.url || "" }));
    } catch (error) {
      setErrors(prev => ({ ...prev, imageUrl: "Erreur lors de l'upload de l'image" }));
    } finally {
      setUploading(false);
    }
  };

  // Gestion de l'upload d'images multiples
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    // Appel à l'API pour obtenir les credentials ImageKit
    const res = await fetch("/api/upload-auth");
    if (!res.ok) {
      setErrors(prev => ({ ...prev, images: "Erreur d'authentification ImageKit" }));
      return;
    }
    const { signature, expire, token, publicKey } = await res.json();
    try {
      // Upload chaque image sur ImageKit
      const uploadPromises = files.map(file =>
        upload({
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
      setFormData(prev => ({
        ...prev,
        images: [
          ...(Array.isArray(prev.images) ? prev.images.filter((i): i is string | File => typeof i === 'string' && i.startsWith('http') || i instanceof File) : []),
          ...urls.filter((i): i is string => typeof i === 'string' && i.startsWith('http'))
        ]
      }));
    } catch (err) {
      setErrors(prev => ({ ...prev, images: "Erreur lors de l'upload sur ImageKit" }));
    }
  };

  // Pour la gestion des variantes :
  const [variant, setVariant] = useState({ name: "", value: "", price: "" });
  const handleAddVariant = () => {
    if (!variant.name || !variant.value || !variant.price) return;
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...variant }] }));
    setVariant({ name: "", value: "", price: "" });
  };
  const handleRemoveVariant = (idx: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      // On ne garde que les URLs valides (http) pour l'API
      const filteredImages = Array.isArray(formData.images) ? formData.images.filter((i): i is string => typeof i === 'string' && i.startsWith('http')) : [];
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[ùû]/g, "u").replace(/[ôö]/g, "o").replace(/[îï]/g, "i").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim(),
          price: parseFloat(formData.price),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
          stock: parseInt(formData.stock),
          shippingPrice: formData.shippingPrice ? parseFloat(formData.shippingPrice.toString()) : null,
          variants: formData.variants,
          images: filteredImages,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.error || "Erreur lors de la mise à jour du produit");
        return;
      }
      router.push("/admin/products");
    } catch (error) {
      setApiError("Erreur lors de la mise à jour du produit");
    } finally {
      setSaving(false);
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Affichage si produit non trouvé
  if (productNotFound) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas.</p>
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center text-orange-500 hover:text-orange-700 font-semibold transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux produits
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-orange-600 mb-1">Modifier le produit</h1>
              <p className="text-orange-400">Modifiez les informations du produit</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-gradient-to-br from-orange-100 via-white to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-8">
            <h2 className="text-xl font-bold text-orange-500 mb-6">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nom du produit */}
              <div>
                <label htmlFor="name" className="block text-base font-bold text-orange-700 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow ${errors.name ? "border-red-500" : "border-orange-200"}`}
                  placeholder="Ex: iPhone 14 Pro"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              {/* Catégorie */}
              <div>
                <label htmlFor="categoryId" className="block text-base font-bold text-orange-700 mb-2">Catégorie *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 shadow ${errors.categoryId ? "border-red-500" : "border-orange-200"}`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>
              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-base font-bold text-orange-700 mb-2">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow ${errors.description ? "border-red-500" : "border-orange-200"}`}
                  placeholder="Description détaillée du produit..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
              {/* Image principale */}
              <div>
                <label htmlFor="imageUrl" className="block text-base font-bold text-orange-700 mb-2">Image principale *</label>
                <div className="flex items-center space-x-4">
                  <input type="file" id="imageUrl" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="imageUrl" className="inline-flex items-center px-4 py-2 border-2 border-orange-300 rounded-xl cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold shadow transition">
                    <Upload className="w-5 h-5 mr-2" />
                    {uploading ? "Upload en cours..." : "Choisir une image"}
                  </label>
                  {formData.imageUrl && formData.imageUrl.startsWith('http') && (
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu du produit"
                      className="mt-2 w-32 h-32 object-cover rounded-xl border border-orange-200 shadow"
                    />
                  )}
                </div>
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
              </div>
              {/* Images multiples */}
              <div>
                <label htmlFor="images" className="block text-base font-bold text-orange-700 mb-2">Autres images</label>
                <input type="file" id="images" accept="image/*" multiple onChange={handleImagesUpload} className="block" />
                <div className="flex flex-col items-center gap-2 mt-2">
                  {/* Image principale en grand */}
                  {(() => {
                    const imgs = Array.isArray(formData.images) ? formData.images.filter((img): img is string => typeof img === 'string' && !!img) : [];
                    const mainImage = imgs[0] || formData.imageUrl || '/placeholder.png';
                    return (
                      <img src={mainImage} alt="Aperçu principal" className="w-32 h-32 object-cover rounded-2xl border-4 border-orange-200 shadow-lg mb-2 transition-transform hover:scale-105" />
                    );
                  })()}
                  {/* Miniatures (hors image principale) */}
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(formData.images) && formData.images.filter((img): img is string => typeof img === 'string' && !!img).slice(1).map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`img-${idx}`} className="w-16 h-16 object-cover rounded-xl border-2 border-orange-200 shadow transition-transform hover:scale-110" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx + 1) }))} className="absolute -top-2 -right-2 bg-white border border-red-300 text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition" title="Supprimer cette image">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-base font-bold text-orange-700 mb-2">Stock *</label>
                <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} min="0" className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow ${errors.stock ? "border-red-500" : "border-orange-200"}`} placeholder="0" />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>
              {/* Prix et prix comparé */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-base font-bold text-orange-700 mb-2">Prix principal (FCFA) *</label>
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow ${errors.price ? "border-red-500" : "border-orange-200"}`} placeholder="0.00" />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
                <div>
                  <label htmlFor="comparePrice" className="block text-base font-bold text-orange-700 mb-2">Prix comparé (FCFA)</label>
                  <input type="number" id="comparePrice" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange} step="0.01" min="0" className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow ${errors.comparePrice ? "border-red-500" : "border-orange-200"}`} placeholder="0.00" />
                  {errors.comparePrice && <p className="mt-1 text-sm text-red-600">{errors.comparePrice}</p>}
                </div>
              </div>
              {/* Variantes */}
              <div className="md:col-span-2">
                <label className="block text-base font-bold text-orange-700 mb-2">Variantes (option, valeur, prix)</label>
                <div className="flex flex-col md:flex-row gap-2 mb-2">
                  <input type="text" placeholder="Option (ex: Capacité, Taille)" value={variant.name} onChange={e => setVariant({ ...variant, name: e.target.value })} className="border-2 border-orange-200 rounded-xl p-2 flex-1 bg-white text-orange-900 shadow" />
                  <input type="text" placeholder="Valeur (ex: 128Go, XL)" value={variant.value} onChange={e => setVariant({ ...variant, value: e.target.value })} className="border-2 border-orange-200 rounded-xl p-2 flex-1 bg-white text-orange-900 shadow" />
                  <input type="number" placeholder="Prix (FCFA)" value={variant.price} onChange={e => setVariant({ ...variant, price: e.target.value })} className="border-2 border-orange-200 rounded-xl p-2 w-28 bg-white text-orange-900 shadow" min="0" />
                  <button type="button" onClick={handleAddVariant} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow transition flex items-center gap-1"><span>+</span> Ajouter</button>
                </div>
                {formData.variants.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mb-2">
                    {formData.variants.map((v, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm mb-1 bg-orange-100 rounded-full px-4 py-1 shadow border border-orange-200">
                        <span className="font-semibold text-orange-900">{v.name}:</span> <span>{v.value}</span> <span className="text-orange-700">{v.price} FCFA</span>
                        <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 hover:underline ml-2">Supprimer</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {/* Prix de livraison */}
          <ProductFormSection title="Prix de livraison">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shippingPrice" className="block text-base font-bold text-orange-700 mb-2">Prix de livraison (FCFA)</label>
                <input type="number" id="shippingPrice" name="shippingPrice" value={formData.shippingPrice} onChange={handleInputChange} step="0.01" min="0" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-orange-900 placeholder-orange-300 shadow" placeholder="0.00" />
              </div>
            </div>
          </ProductFormSection>
          {/* Actions */}
          <div className="flex justify-end mt-8">
            <button type="submit" className="px-8 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg flex items-center gap-2 transition" disabled={saving}>
              <Save className="w-5 h-5" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 