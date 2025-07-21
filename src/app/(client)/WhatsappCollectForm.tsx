"use client";
import React from 'react';
import { useAuth } from "@/hooks/useAuth";

export default function WhatsappCollectForm() {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Timer d'apparition après 25s
  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), 25000);
    return () => clearTimeout(timer);
  }, []);

  // Ne pas afficher si déjà soumis (persistant)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('whatsapp_lead_closed')) {
      setShow(false);
    }
  }, []);

  if (isAuthenticated) return null;

  if (!show) return null;

  function handleClose() {
    setShow(false);
    localStorage.setItem('whatsapp_lead_closed', '1'); // <-- Ajout ici pour ne plus réafficher
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        setSuccess(true);
        localStorage.setItem('whatsapp_lead_closed', '1');
        setTimeout(() => setShow(false), 3000);
      } else {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center animate-fade-in">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" aria-label="Fermer le formulaire">×</button>
        <div className="text-2xl mb-2">📱</div>
        <h2 className="text-lg font-bold mb-2 text-amber-700 text-center">Recevez nos offres sur WhatsApp !</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Entrez votre numéro WhatsApp pour ne rien manquer de nos nouveautés et promos.</p>
        {success ? (
          <div className="text-green-600 font-semibold text-center">Merci ! Nous vous tiendrons informé sur WhatsApp.</div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <input
              type="tel"
              placeholder="Numéro WhatsApp"
              className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              pattern="[0-9+ ]{8,15}"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
              disabled={loading || phone.length < 8}
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
            {error && <div className="text-red-600 text-xs text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 