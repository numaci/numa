"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import type { ChangeEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (f = form) => {
    const e: Record<string, string> = {};
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phoneRegex = /^(\+|00)?\d{8,15}$/;
    const localPhoneRegex = /^\d{8}$/;
    if (!f.emailOrPhone || (!emailRegex.test(f.emailOrPhone) && !phoneRegex.test(f.emailOrPhone.replace(/\s/g, "")) && !localPhoneRegex.test(f.emailOrPhone.replace(/\s/g, "")))) {
      e.emailOrPhone = "Email ou numéro de téléphone invalide";
    }
    if (!f.password) e.password = "Mot de passe requis";
    return e;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors(validate({ ...form, [name]: value }));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setApiError("");

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        // Essayer d'abord la connexion NextAuth (User/Admin)
        const result = await signIn("credentials", {
          emailOrPhone: form.emailOrPhone,
          password: form.password,
          redirect: false,
        });

        if (result?.ok && !result?.error) {
          router.push("/products");
          router.refresh();
          return;
        }

        // Si la connexion NextAuth échoue, essayer la connexion fournisseur
        const res = await fetch("/api/auth/supplier/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.emailOrPhone, password: form.password }),
        });
        if (res.ok) {
          // Connexion fournisseur réussie
          const data = await res.json();
          if (data.supplierId) {
            localStorage.setItem("supplierId", data.supplierId);
          }
          router.push("/products");
          return;
        } else {
          const data = await res.json();
          setApiError(data.message || "Email ou mot de passe incorrect");
        }
      } catch (error) {
        setApiError("Erreur de connexion. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-2xl shadow inline-block">Bienvenue sur Sikasso Sugu</h2>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-amber-600">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white/90 p-8 rounded-2xl shadow-2xl">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {apiError}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-700">Email ou numéro de téléphone</label>
            <input
              type="text"
              name="emailOrPhone"
              value={form.emailOrPhone}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              required
              disabled={isLoading}
            />
            {errors.emailOrPhone && <div className="text-red-500 text-xs mt-1">{errors.emailOrPhone}</div>}
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
              disabled={isLoading}
            />
            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
          </div>
          <div className="flex justify-between items-center text-xs">
            <Link href="/forgot-password" className="underline text-amber-600">Mot de passe oublié ?</Link>
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
          <div className="text-center text-xs text-gray-500 mt-2">
            Pas encore de compte ? <Link href="/register" className="underline text-amber-600">Créer un compte</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 