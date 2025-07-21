"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductsLayout from "@/components/shop/ProductsLayout";
import ProductGrid from "@/components/shop/ProductGrid";
import ClientLayout from "@/components/layout/ClientLayout";
import { FaSearch } from "react-icons/fa";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError("");
    fetch(`/api/products?search=${encodeURIComponent(query)}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Erreur lors de la recherche."))
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-2xl font-bold text-amber-700 mb-4 flex items-center gap-2">
          <FaSearch /> Résultats de recherche
        </h1>
        {query && (
          <p className="mb-6 text-amber-600">Recherche pour : <span className="font-semibold">{query}</span></p>
        )}
        {loading ? (
          <div className="text-center text-amber-500 py-12">Chargement...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Aucun produit trouvé.</div>
        ) : (
          <>
            <ProductGrid products={products} />
            {/* Pagination simple */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-full border ${page === i + 1 ? "bg-amber-500 text-white" : "bg-white text-amber-700 border-amber-300"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-4">{total} produit(s) trouvé(s)</div>
          </>
        )}
      </div>
    </ClientLayout>
  );
} 