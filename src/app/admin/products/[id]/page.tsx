"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images: string[];
  price: number;
  comparePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBest: boolean;
  ordersCount: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error("Produit introuvable");
        const data = await res.json();
        setProduct(data.product || data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du produit");
      }
      setLoading(false);
    }
    if (id) fetchProduct();
  }, [id]);

  const handleToggleActive = async () => {
    if (!product) return;
    setToggleLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/toggle-active`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur lors du changement d'état");
      setProduct({ ...product, isActive: !product.isActive });
    } catch (err) {
      alert("Erreur lors du changement d'état");
    }
    setToggleLoading(false);
  };

  const handleSupreme = async () => {
    if (!product) return;
    setToggleLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/supreme`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur lors de la mise en avant");
      setProduct({ ...product, isFeatured: true });
    } catch (err) {
      alert("Erreur lors de la mise en avant");
    }
    setToggleLoading(false);
  };

  const handleEdit = () => {
    router.push(`/admin/products/${id}/edit`);
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!product) return null;

  // Normalisation des images (toujours un tableau)
  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images.filter((img): img is string => typeof img === 'string' && !!img && !img.startsWith('blob:'));
  } else if (typeof product.images === "string") {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) images = parsed.filter((img: any): img is string => typeof img === 'string' && !!img && !img.startsWith('blob:'));
    } catch {
      images = [];
    }
  } else {
    images = [];
  }

  // Détermine l'image principale à afficher
  const mainImage = images[0] || product.imageUrl || '/placeholder.png';

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col gap-2 items-center md:w-1/2">
            <img src={mainImage} alt={product.name} className="w-60 h-60 object-cover rounded-xl border border-orange-200 shadow" />
            <div className="flex flex-wrap gap-2 mt-2">
              {images.slice(1).map((img, idx) => (
                <img key={idx} src={img} alt={`img-${idx}`} className="w-16 h-16 object-cover rounded-xl border border-orange-200 shadow" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-orange-600 mb-2">{product.name}</h1>
            <p className="text-orange-900 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-orange-700">{product.price.toLocaleString()} FCFA</span>
              {product.comparePrice && (
                <span className="ml-3 text-lg line-through text-orange-400">{product.comparePrice.toLocaleString()} FCFA</span>
              )}
            </div>
            <div className="mb-2 text-orange-800">Stock : <b>{product.stock}</b></div>
            <div className="mb-2 text-orange-800">Nombre de commandes : <b>{product.ordersCount}</b></div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSupreme} disabled={product.isFeatured || toggleLoading} className={`px-4 py-2 rounded-xl font-bold shadow transition ${product.isFeatured ? "bg-amber-400 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>{product.isFeatured ? "Déjà Supreme" : "Supreme"}</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-xl font-bold shadow bg-blue-500 hover:bg-blue-600 text-white">Modifier</button>
              <button onClick={handleToggleActive} disabled={toggleLoading} className={`px-4 py-2 rounded-xl font-bold shadow ${product.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"} text-white`}>
                {product.isActive ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 