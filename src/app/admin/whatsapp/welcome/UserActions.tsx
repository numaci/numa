"use client";
import React from 'react';

function getWhatsappLink(phone: string, name: string, message: string) {
  const personalized = message.replace('{name}', name || '');
  const encoded = encodeURIComponent(personalized);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export default function UserActions({ user, onWelcomed, customMessage }: { user: { id: string, firstName: string | null, phone: string | null }, onWelcomed: () => void, customMessage: string }) {
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSendWhatsapp(e: React.MouseEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    // Ouvre WhatsApp dans un nouvel onglet avec le message personnalisé
    window.open(getWhatsappLink(user.phone!, user.firstName || '', customMessage), '_blank');
    // Marque comme accueilli côté serveur
    try {
      const res = await fetch(`/api/admin/whatsapp/${user.id}/welcome`, { method: 'POST' });
      if (res.ok) {
        onWelcomed(); // Retire l'utilisateur de la liste
      } else {
        setError('Erreur lors de la mise à jour.');
      }
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
      <button
        onClick={handleSendWhatsapp}
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={sending}
        aria-label="Envoyer un message WhatsApp et marquer comme accueilli"
      >
        {sending ? 'Envoi...' : 'Envoyer WhatsApp'}
      </button>
      {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
    </div>
  );
} 