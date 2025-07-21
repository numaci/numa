"use client";
import { useState } from "react";

function generatePassword() {
  // Génère un code numérique de 4 ou 5 chiffres
  const length = Math.random() < 0.5 ? 4 : 5;
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += Math.floor(Math.random() * 10).toString();
  }
  return pwd;
}

export default function ResetRequestCardClient({ req, onRemove }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const pwd = generatePassword();
    // Appel API pour mettre à jour le mot de passe
    const res = await fetch(`/api/admin/users/${req.user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd })
    });
    if (res.ok) {
      setPassword(pwd);
      setSuccess(true);
    } else {
      setError("Erreur lors de la mise à jour du mot de passe.");
    }
    setLoading(false);
  };

  const handleMarkSent = async () => {
    setMarking(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/reset-requests/${req.id}/mark-sent`, {
        method: "POST"
      });
      if (res.ok && onRemove) {
        onRemove(req.id);
      }
    } catch {
      setError("Erreur lors de la mise à jour du statut.");
    } finally {
      setMarking(false);
    }
  };

  const whatsappMsg = `Bonjour ${req.user.firstName}, voici votre nouveau mot de passe temporaire : ${password} . Merci de le changer après connexion.`;
  const whatsappLink = req.user.phone ? `https://wa.me/${req.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMsg)}` : "#";

  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <div className="font-semibold text-lg text-amber-700">{req.user.firstName} {req.user.lastName}</div>
        <div className="text-sm text-gray-600">Email : {req.user.email || <span className='text-gray-400'>Non renseigné</span>}</div>
        <div className="text-sm text-gray-600">Téléphone : {req.user.phone || <span className='text-gray-400'>Non renseigné</span>}</div>
        <div className="text-xs text-gray-400">Demande du {new Date(req.createdAt).toLocaleString()}</div>
      </div>
      <div className="flex flex-col gap-2 min-w-[220px]">
        {!password ? (
          <button
            onClick={handleGenerate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow"
            disabled={loading}
          >
            {loading ? "Génération..." : "Générer mot de passe"}
          </button>
        ) : (
          <>
            <div className="bg-gray-100 rounded px-3 py-2 text-center font-mono text-lg tracking-widest mb-1">{password}</div>
            {req.user.phone && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full text-center shadow"
              >
                Envoyer sur WhatsApp
              </a>
            )}
          </>
        )}
        <button
          onClick={handleMarkSent}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-full shadow w-full mt-1"
          disabled={marking}
        >
          {marking ? "Mise à jour..." : "Marquer comme envoyé"}
        </button>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        {success && <div className="text-green-600 text-xs mt-1">Mot de passe mis à jour !</div>}
      </div>
    </div>
  );
} 