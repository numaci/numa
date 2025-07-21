"use client";

import { useEffect, useState } from 'react';

export default function NotificationSettingsPage() {
  const [email, setEmail] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Charger l'email actuel et l'expéditeur
    fetch('/api/admin/settings/notifications')
      .then(res => res.json())
      .then(data => {
        setEmail(data.email || '');
        setSenderEmail(data.senderEmail || '');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/settings/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senderEmail })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Configuration mise à jour !');
    } else {
      setMessage(data.error || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Notifications commandes</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email destinataire</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email expéditeur (doit être validé sur Brevo)</label>
            <input
              type="email"
              value={senderEmail}
              onChange={e => setSenderEmail(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded"
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          {message && <div className="mt-2 text-green-600">{message}</div>}
        </form>
      )}
    </div>
  );
} 