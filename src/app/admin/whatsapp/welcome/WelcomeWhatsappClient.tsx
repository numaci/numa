"use client";
import React from 'react';
import UserActions from './UserActions';

export default function WelcomeWhatsappClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = React.useState(initialUsers);
  const [customMessage, setCustomMessage] = React.useState("Bonjour {name}, bienvenue sur notre site ! Nous sommes ravis de vous compter parmi nos membres. N'hésitez pas à nous contacter si vous avez des questions.");
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [removeError, setRemoveError] = React.useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = React.useState(true);
  const [savingMessage, setSavingMessage] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Charger le message depuis l'API au montage
  React.useEffect(() => {
    async function fetchMessage() {
      setLoadingMessage(true);
      try {
        const res = await fetch('/api/admin/whatsapp/welcome-message');
        if (res.ok) {
          const data = await res.json();
          if (data.message) setCustomMessage(data.message);
        }
      } finally {
        setLoadingMessage(false);
      }
    }
    fetchMessage();
  }, []);

  // Sauvegarder le message en base de données
  async function handleSaveMessage() {
    setSavingMessage(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/whatsapp/welcome-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: customMessage })
      });
      if (!res.ok) setSaveError("Erreur lors de la sauvegarde.");
    } catch {
      setSaveError("Erreur réseau lors de la sauvegarde.");
    } finally {
      setSavingMessage(false);
    }
  }

  function handleWelcomed(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/admin/whatsapp/${userId}/welcome`, { method: 'POST' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setRemoveError("Erreur lors de la suppression côté serveur.");
      }
    } catch {
      setRemoveError("Erreur réseau lors de la suppression.");
    } finally {
      setRemovingId(null);
    }
  }

  if (users.length === 0) {
    return <div className="p-8 text-center text-lg text-green-600 font-semibold">Aucun nouvel inscrit à accueillir 🎉</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 text-amber-700">Nouveaux inscrits à accueillir sur WhatsApp</h1>
      {/* Section personnalisation du message */}
      <div className="mb-6 p-4 bg-amber-50 rounded-xl shadow flex flex-col gap-2">
        <label htmlFor="custom-message" className="font-semibold text-amber-700">Message de bienvenue personnalisé&nbsp;:</label>
        <textarea
          id="custom-message"
          className="border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900 min-h-[60px]"
          value={customMessage}
          onChange={e => setCustomMessage(e.target.value)}
          disabled={loadingMessage || savingMessage}
        />
        <span className="text-xs text-gray-500">Utilisez <code>{'{name}'}</code> pour insérer automatiquement le prénom de l'utilisateur.</span>
        <div className="flex gap-2 mt-2 items-center">
          <button
            onClick={handleSaveMessage}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50"
            disabled={loadingMessage || savingMessage}
          >
            {savingMessage ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {saveError && <span className="text-red-600 text-xs">{saveError}</span>}
          {loadingMessage && <span className="text-gray-400 text-xs">Chargement...</span>}
        </div>
      </div>
      {/* Table desktop, cards mobile */}
      <div className="hidden sm:block">
        <table className="w-full bg-white rounded-xl shadow overflow-hidden">
          <thead>
            <tr className="bg-amber-100 text-amber-700">
              <th className="py-2 px-4 text-left">Nom</th>
              <th className="py-2 px-4 text-left">Téléphone</th>
              <th className="py-2 px-4 text-left">Date d'inscription</th>
              <th className="py-2 px-4">Action</th>
              <th className="py-2 px-4">Retirer</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-b-0">
                <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-4">{user.phone}</td>
                <td className="py-2 px-4">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 text-center">
                  <UserActions user={user} onWelcomed={() => handleWelcomed(user.id)} customMessage={customMessage} />
                </td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleRemove(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Retirer manuellement"
                    disabled={removingId === user.id}
                  >
                    {removingId === user.id ? 'Retrait...' : 'Retirer'}
                  </button>
                  {removeError && removingId === user.id && (
                    <span className="text-red-600 text-xs mt-1 block">{removeError}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden flex flex-col gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="font-bold text-amber-700 text-lg">{user.firstName} {user.lastName}</div>
            <div className="text-gray-700 text-sm">{user.phone}</div>
            <div className="text-gray-500 text-xs mb-2">Inscrit le {new Date(user.createdAt).toLocaleString()}</div>
            <div className="flex gap-2">
              <UserActions user={user} onWelcomed={() => handleWelcomed(user.id)} customMessage={customMessage} />
              <button
                onClick={() => handleRemove(user.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Retirer manuellement"
                disabled={removingId === user.id}
              >
                {removingId === user.id ? 'Retrait...' : 'Retirer'}
              </button>
              {removeError && removingId === user.id && (
                <span className="text-red-600 text-xs mt-1 block">{removeError}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">Après avoir envoyé le message, l'utilisateur disparaît automatiquement de la liste. Vous pouvez aussi retirer manuellement une personne.</p>
    </div>
  );
} 