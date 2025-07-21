"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState(""); // email ou numéro
  const [inputType, setInputType] = useState<"email" | "phone" | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "" });
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Détecter si c'est un email ou un numéro
  function detectType(value: string) {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "email";
    if (/^[0-9+ ]{8,15}$/.test(value)) return "phone";
    return null;
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const type = detectType(input.trim());
    setInputType(type);
    if (!type) {
      setError("Veuillez entrer un numéro de téléphone ou un email valide.");
      setLoading(false);
      return;
    }
    // Vérifier existence via API
    try {
      const res = await fetch("/api/auth/check-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: input.trim(), type })
      });
      const data = await res.json();
      setExists(data.exists);
      setStep(2);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: input.trim(),
          ...form,
          password: form.password
        })
      });
      if (res.ok) {
        // Connexion automatique après inscription avec NextAuth
        const signInRes = await signIn("credentials", {
          redirect: false,
          [inputType!]: input.trim(),
          password: form.password,
        });
        if (signInRes && !signInRes.error) {
          router.push("/products");
        } else {
          router.push("/login?register=1");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [inputType!]: input.trim(),
          password
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        router.push("/profile");
      } else {
        const data = await res.json();
        setError(data.error || "Identifiants incorrects.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-amber-700 mb-6 text-center">Inscription</h1>
        {step === 1 && (
          <form onSubmit={handleCheck} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Numéro de téléphone ou email"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={input}
              onChange={e => setInput(e.target.value)}
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
              disabled={loading || input.length < 5}
            >
              {loading ? "Vérification..." : "Continuer"}
            </button>
            {error && <div className="text-red-600 text-xs text-center">{error}</div>}
          </form>
        )}
        {step === 2 && exists === true && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="block text-sm font-semibold mb-1 text-amber-700" htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              placeholder="Mot de passe"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
              disabled={loading || password.length < 4}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            {error && <div className="text-red-600 text-xs text-center">{error}</div>}
          </form>
        )}
        {step === 2 && exists === false && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-2xl shadow inline-block">Bienvenue sur Sikasso Sugu</h2>
            </div>
            <div className="text-sm text-gray-700 text-center mb-2">Nouveau compte. Complétez les informations.</div>
            <input
              type="text"
              placeholder="Prénom"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Nom"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
              disabled={loading || !form.firstName || !form.lastName || form.password.length < 4}
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
            {error && <div className="text-red-600 text-xs text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 