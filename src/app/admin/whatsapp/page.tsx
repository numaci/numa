import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WhatsappAdminPage() {
  const whatsappConfigs = await prisma.whatsappConfig.findMany({
    orderBy: { createdAt: "desc" },
  });
  // Récupérer les leads WhatsApp
  const leads = await prisma.whatsappLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-end mb-4 gap-2">
        <Link href="/admin/settings/notifications" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition">
          Config email commandes
        </Link>
        <Link href="/admin/whatsapp/welcome" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow transition">
          Nouveaux inscrits WhatsApp
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Gestion des numéros WhatsApp</h1>
      <form action="/api/admin/whatsapp" method="POST" className="flex gap-2 mb-6">
        <input
          name="number"
          placeholder="Numéro WhatsApp (ex: 66434050 ou +22366434050)"
          className="flex-1 border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          required
        />
        <select name="type" className="border border-orange-300 rounded-lg px-2 py-2 text-orange-900">
          <option value="order">Commande</option>
          <option value="welcome">Bienvenue</option>
        </select>
        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600">Ajouter</button>
      </form>
      {/* Formulaire pour ajouter un numéro de paiement */}
      <form action="/api/admin/whatsapp" method="POST" className="flex gap-2 mb-6">
        <input
          name="number"
          placeholder="Numéro de paiement (ex: +223 70 12 34 56)"
          className="flex-1 border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent text-green-900"
          required
        />
        <input
          name="label"
          placeholder="Nom du service (ex: Orange Money, Moov, Wave)"
          className="w-48 border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent text-green-900"
          required
        />
        <input type="hidden" name="type" value="payment" />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">Ajouter paiement</button>
      </form>
      <table className="w-full border border-orange-100 rounded-xl overflow-hidden">
        <thead className="bg-orange-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-bold text-orange-600">Numéro</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-orange-600">Type</th>
            <th className="px-3 py-2 text-center text-xs font-bold text-orange-600">Actif</th>
            <th className="px-3 py-2 text-center text-xs font-bold text-orange-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {whatsappConfigs.map((w) => (
            <tr key={w.id} className="border-t border-orange-100">
              <td className="px-3 py-2 text-sm text-orange-900">{w.number}</td>
              <td className="px-3 py-2 text-sm text-orange-700">{w.type}</td>
              <td className="px-3 py-2 text-center">
                {w.isActive ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Oui</span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Non</span>
                )}
              </td>
              <td className="px-3 py-2 text-center">
                {/* Actions à implémenter (activer/désactiver, supprimer) */}
                <form action={`/api/admin/whatsapp/${w.id}/toggle`} method="POST" className="inline">
                  <button type="submit" className="text-xs text-blue-600 hover:underline mr-2">
                    {w.isActive ? "Désactiver" : "Activer"}
                  </button>
                </form>
                <form action={`/api/admin/whatsapp/${w.id}/delete`} method="POST" className="inline">
                  <button type="submit" className="text-xs text-red-600 hover:underline">Supprimer</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Section leads WhatsApp collectés */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-amber-700">Numéros WhatsApp collectés</h2>
        {leads.length === 0 ? (
          <div className="text-gray-500 text-center">Aucun numéro collecté pour l'instant.</div>
        ) : (
          <table className="w-full border border-amber-100 rounded-xl overflow-hidden mb-6">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-amber-600">Numéro</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-amber-600">Date</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-amber-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const message = encodeURIComponent("Bonjour, bienvenue sur Sikasso Sugu ! Découvrez nos offres et passez vos commandes en toute confiance.");
                const waLink = `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${message}`;
                return (
                  <tr key={lead.id} className="border-t border-amber-100">
                    <td className="px-3 py-2 text-sm text-amber-900">{lead.phone}</td>
                    <td className="px-3 py-2 text-sm text-amber-700">{new Date(lead.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full shadow text-xs"
                      >
                        Envoyer WhatsApp
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 