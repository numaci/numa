'use client';
import Link from "next/link";
import SupplierTable from "@/components/admin/suppliers/SupplierTable";
import { useState, useEffect } from "react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/suppliers");
        if (!res.ok) throw new Error("Erreur lors du chargement des fournisseurs");
        const data = await res.json();
        setSuppliers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const suppliersWithoutPassword = filteredSuppliers.map(({ password, ...rest }) => rest);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 overflow-visible p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-orange-700">Fournisseurs</h1>
          <p className="text-gray-500 text-sm">Gérez vos fournisseurs et leurs informations.</p>
        </div>
        <Link href="/admin/suppliers/new" className="bg-gradient-to-r from-orange-500 to-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow hover:scale-105 transition">Ajouter</Link>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="block w-full md:w-80 rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-visible z-0 p-2 md:p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <SupplierTable suppliers={suppliersWithoutPassword} />
        )}
      </div>
    </div>
  );
} 