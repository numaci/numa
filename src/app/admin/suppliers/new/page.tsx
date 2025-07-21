'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSupplierPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || "Un fournisseur avec cet email existe déjà.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Erreur lors de la création du fournisseur");
      router.push("/admin/suppliers");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 mt-10">
      <div className="flex items-center mb-6 gap-2">
        <Link href="/admin/suppliers" className="text-orange-600 hover:underline font-semibold">&larr; Retour</Link>
        <h1 className="text-2xl font-bold text-orange-700 ml-2">Nouveau fournisseur</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Nom</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" required minLength={4} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Téléphone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Adresse</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" />
        </div>
        {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
        <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow hover:scale-105 transition disabled:opacity-60" disabled={loading}>
          {loading ? "Ajout en cours..." : "Ajouter le fournisseur"}
        </button>
      </form>
    </div>
  );
} 