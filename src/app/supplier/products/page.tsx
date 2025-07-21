"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaSearch, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  PUBLISHED: { label: "Publié", color: "bg-green-100 text-green-700" },
  REFUSED: { label: "Refusé", color: "bg-red-100 text-red-700" },
};

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"desc"|"asc">("desc");

  useEffect(() => {
    fetchProducts();
  }, [search, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
    try {
      const res = await fetch(`/api/supplier/products?supplierId=${supplierId}&search=${encodeURIComponent(search)}&sort=${sort}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur chargement produits");
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "Erreur technique");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const res = await fetch(`/api/supplier/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      setProducts(products => products.filter(p => p.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
      <div className="max-w-6xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-amber-600">Mes produits</h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
            </div>
            <button
              className="ml-2 px-4 py-2 rounded-full border border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold"
              onClick={() => setSort(s => s === "desc" ? "asc" : "desc")}
            >
              <FaClock className="inline mr-1" />
              {sort === "desc" ? "Plus récents" : "Plus anciens"}
            </button>
            <Link href="/supplier/products/new" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 ml-2">+ Ajouter</Link>
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-amber-50">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Prix</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Chargement...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Aucun produit trouvé.</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="border-b hover:bg-amber-50">
                  <td className="p-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-xl border" />
                    ) : (
                      <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center text-amber-400">?</div>
                    )}
                  </td>
                  <td className="p-3 font-semibold">{product.name}</td>
                  <td className="p-3">{Number(product.price).toLocaleString()} FCFA</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[product.status || "PENDING"]?.color || "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABELS[product.status || "PENDING"]?.label || product.status}
                    </span>
                    {product.status === "REFUSED" && product.refuseComment && (
                      <div className="text-xs text-red-500 mt-1">{product.refuseComment}</div>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link href={`/supplier/products/${product.id}/edit`} className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700" title="Modifier"><FaEdit /></Link>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700" title="Supprimer"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 