"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SupplierProfilePage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
    if (!supplierId) {
      router.push("/login");
      return;
    }
    fetch(`/api/admin/suppliers/${supplierId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Fournisseur introuvable");
        return res.json();
      })
      .then((data) => {
        setSupplier(data);
        setLoading(false);
      })
      .catch(() => {
        setSupplier(null);
        setLoading(false);
        router.push("/login");
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!oldPassword || !newPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors du changement de mot de passe.");
      } else {
        setSuccess("Mot de passe modifié avec succès !");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setError("Erreur technique : " + (err?.message || String(err)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-amber-600">Modifier mon mot de passe</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">{success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Ancien mot de passe</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
} 