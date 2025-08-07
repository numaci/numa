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
        emailOrPhone: email,
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
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* En-tête de la page */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-black tracking-tight antialiased">Administration</h2>
          <p className="mt-2 text-base text-gray-600 antialiased">Accédez à votre tableau de bord</p>
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
                className="admin-input rounded-t-xl rounded-b-none border-b-0 placeholder-gray-500 text-black antialiased"
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
                className="admin-input rounded-b-xl rounded-t-none placeholder-gray-500 text-black antialiased"
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
              className="admin-button admin-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>

          {/* Lien vers la page d'accueil */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="font-medium text-gray-600 hover:text-black transition-colors duration-300 ease-in-out antialiased"
            >
              Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 