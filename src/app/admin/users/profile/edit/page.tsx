"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) return <div className="p-8">Chargement...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          newPassword: form.newPassword,
          currentPassword: form.currentPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setSuccess("Profil mis à jour avec succès !");
      setForm({ ...form, newPassword: "", currentPassword: "" });
    } catch (err: any) {
      setError(err.message);
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
          <h1 className="text-2xl font-bold text-gray-900 antialiased">
            📝 Mon Profil Administrateur
          </h1>
          <p className="text-gray-600 mt-1 antialiased">
            Modifiez vos informations personnelles d'administrateur NUMA
          </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Téléphone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="admin-input"
                placeholder="Votre numéro de téléphone"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Adresse email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="admin-input bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1 antialiased">
                L'adresse email ne peut pas être modifiée
              </p>
            </div>
          </div>

          {/* Sécurité */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 antialiased">Sécurité</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="admin-input"
                placeholder="Laisser vide pour ne pas changer"
              />
              <p className="text-xs text-gray-500 mt-1 antialiased">
                Laissez vide si vous ne souhaitez pas changer votre mot de passe
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
                Mot de passe actuel
                <span className="text-xs text-gray-500 ml-1">(requis pour changer le mot de passe)</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="admin-input"
                placeholder="Votre mot de passe actuel"
              />
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
              {loading ? "⏳ Enregistrement..." : "💾 Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}