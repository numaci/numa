import Link from "next/link";
import { useState } from "react";

export default function SupplierTable({ suppliers: initialSuppliers }: { suppliers: any[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression du fournisseur");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-orange-100 rounded-xl overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">
            <th className="px-4 py-3 border-b font-bold text-left">Nom</th>
            <th className="px-4 py-3 border-b font-bold text-left">Email</th>
            <th className="px-4 py-3 border-b font-bold text-left">Téléphone</th>
            <th className="px-4 py-3 border-b font-bold text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-6 text-gray-500">Aucun fournisseur trouvé.</td>
            </tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-orange-50 transition border-b last:border-b-0">
                <td className="border-b px-4 py-3 font-medium text-orange-900">{s.name}</td>
                <td className="border-b px-4 py-3 text-gray-700">{s.email}</td>
                <td className="border-b px-4 py-3 text-gray-700">{s.phone}</td>
                <td className="border-b px-4 py-3">
                  <Link href={`/admin/suppliers/${s.id}`} className="inline-block mr-2 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">Voir</Link>
                  <Link href={`/admin/suppliers/${s.id}/edit`} className="inline-block mr-2 px-3 py-1 rounded bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200 transition">Modifier</Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="inline-block px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                    disabled={loadingId === s.id}
                  >
                    {loadingId === s.id ? "Suppression..." : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 