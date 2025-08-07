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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="admin-button-secondary"
          >
            ← Retour
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 antialiased">👤 Nouvel Administrateur</h1>
          <p className="text-gray-600 mt-1 antialiased">Créez un nouveau compte administrateur pour votre boutique NUMA</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="admin-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 antialiased">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Ex: Jean"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Ex: Dupont"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations de connexion */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 antialiased">Informations de connexion</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Adresse email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="admin-input"
                placeholder="admin@numa-boutique.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1 antialiased">
                Cette adresse sera utilisée pour se connecter à l'administration
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="admin-input"
                placeholder="Mot de passe sécurisé"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1 antialiased">
                Minimum 8 caractères. Utilisez un mot de passe fort.
              </p>
            </div>
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg antialiased">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg antialiased">
              ✅ {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => router.back()}
              className="admin-button-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="admin-button-primary"
            >
              {loading ? "⏳ Création..." : "✅ Créer l'administrateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}