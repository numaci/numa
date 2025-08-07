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
      </div>
    </div>
  );
} 