"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AddAdminPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création de l'admin.");
      } else {
        setSuccess("Nouvel admin créé avec succès !");
        setForm({ firstName: "", lastName: "", email: "", password: "" });
        setTimeout(() => router.push("/admin/users"), 1500);
      }
    } catch (err: any) {
      setError("Erreur technique : " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-amber-700">Ajouter un nouvel admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Prénom</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Nom</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">{success}</div>}
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200">
            {loading ? "Création..." : "Créer l'admin"}
          </Button>
        </form>
      </div>
    </div>
  );
} 