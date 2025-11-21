import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WhatsappAdminPage() {
  let whatsappConfigs: Array<any> = [];
  let leads: Array<any> = [];
  try {
    whatsappConfigs = await prisma.whatsappConfig.findMany({ orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error('[admin/whatsapp] erreur récupération configs:', e);
    whatsappConfigs = [];
  }
  try {
    // Récupérer les leads WhatsApp
    leads = await prisma.whatsappLead.findMany({ orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error('[admin/whatsapp] erreur récupération leads:', e);
    leads = [];
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-end mb-4 gap-2">
        <Link href="/admin/settings/notifications" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition">
          Config email commandes
        </Link>
      </div>
      {/* Optionnel: aperçu basique quand la DB est indisponible */}
      <div className="text-sm text-gray-600">
        <div>Configs WhatsApp: {whatsappConfigs.length}</div>
        <div>Leads WhatsApp: {leads.length}</div>
      </div>
    </div>
  );
} 