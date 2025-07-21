'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params?.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/admin/suppliers/${supplierId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du fournisseur");
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    if (supplierId) fetchSupplier();
  }, [supplierId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || "Un fournisseur avec cet email existe déjà.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Erreur lors de la modification du fournisseur");
      router.push(`/admin/suppliers/${supplierId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 mt-10">
      <div className="flex items-center mb-6 gap-2">
        <Link href={`/admin/suppliers/${supplierId}`} className="text-orange-600 hover:underline font-semibold">&larr; Retour</Link>
        <h1 className="text-2xl font-bold text-orange-700 ml-2">Modifier le fournisseur</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Nom</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Téléphone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Adresse</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input input-bordered w-full" />
        </div>
        {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Modification..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
} 