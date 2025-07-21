"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

// Page de connexion pour l'administration
export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirection si déjà connecté
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/admin/dashboard";
    }
  }, [status]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else if (result?.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError("Erreur inconnue lors de la connexion");
      }
    } catch (err: any) {
      setError("Erreur technique : " + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-600 via-orange-400 to-amber-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/95 rounded-2xl shadow-2xl p-8 border border-orange-100">
        {/* En-tête de la page */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-orange-700 drop-shadow">Connexion Administration</h2>
          <p className="mt-2 text-sm text-orange-400">Accédez à votre tableau de bord d'administration</p>
        </div>

        {/* Formulaire de connexion */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Champ email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-lg relative block w-full px-4 py-3 border border-orange-200 placeholder-orange-300 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:z-10 sm:text-sm bg-white"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-lg relative block w-full px-4 py-3 border border-orange-200 placeholder-orange-300 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:z-10 sm:text-sm bg-white"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Bouton de connexion */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>

          {/* Lien vers la page d'accueil */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="font-medium text-orange-500 hover:text-orange-700"
            >
              Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 