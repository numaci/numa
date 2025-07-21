"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FaLock } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [inputType, setInputType] = useState<"email" | "phone" | null>(null);

  // Détecter si c'est un email ou un numéro
  function detectType(value: string) {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "email";
    if (/^[0-9+ ]{8,15}$/.test(value)) return "phone";
    return null;
  }

  const validate = (value: string) => {
    const type = detectType(value);
    if (!type) return "Veuillez entrer un email ou un numéro de téléphone valide.";
    return "";
  };

  const handleChange = (e: any) => {
    setInput(e.target.value);
    setError(validate(e.target.value));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const err = validate(input);
    setError(err);
    if (!err) {
      setInputType(detectType(input));
      // Création de la demande côté serveur
      try {
        await fetch("/api/auth/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: input.trim() })
        });
      } catch {}
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 rounded-3xl shadow-2xl px-8 py-10 sm:p-12 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full mb-2 shadow">
              <FaLock className="text-amber-500 text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-700 mb-1 text-center">Mot de passe oublié</h1>
            <p className="text-gray-500 text-center text-sm">Saisissez votre email ou numéro de téléphone pour recevoir votre mot de passe.</p>
          </div>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div>
                <label className="block text-sm font-semibold mb-2 text-amber-700" htmlFor="forgot-input">Email ou numéro de téléphone</label>
                <input
                  id="forgot-input"
                  type="text"
                  value={input}
                  onChange={handleChange}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-amber-900 bg-amber-50 placeholder:text-amber-300"
                  required
                  placeholder="ex: exemple@mail.com ou 70 00 00 00"
                />
                {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
              </div>
              <Button type="submit" className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200 py-3">Valider</Button>
              <div className="text-center text-xs text-gray-500 mt-2">
                <Link href="/login" className="underline text-amber-600">Retour à la connexion</Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-green-100 p-3 rounded-full mb-1 shadow">
                  <FaLock className="text-green-500 text-2xl" />
                </div>
                {inputType === "email" && (
                  <div className="text-green-700 font-semibold text-center">Votre mot de passe vous sera envoyé par email sous 24h.</div>
                )}
                {inputType === "phone" && (
                  <div className="text-green-700 font-semibold text-center">Votre mot de passe vous sera envoyé sur WhatsApp sous 24h.</div>
                )}
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                <Link href="/login" className="underline text-amber-600">Retour à la connexion</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 