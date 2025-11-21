import { Metadata } from 'next'
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ResetRequestsClient from "./ResetRequestsClient";

export const metadata: Metadata = {
  title: 'Demandes de Réinitialisation | Administration NUMA',
  description: 'Gérez les demandes de réinitialisation de mot de passe des clients NUMA'
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ResetRequestsPage() {
  // Récupérer toutes les demandes en attente
  let requests: any[] = [];
  try {
    requests = await prisma.passwordResetRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: {
        user: true,
      },
    });
  } catch (e) {
    console.error('[admin/users/reset-requests] erreur récupération demandes:', e);
    requests = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/admin/users"
            className="admin-button-secondary"
          >
            ← Retour aux clients
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 antialiased">
            📧 Demandes de Réinitialisation
          </h1>
          <p className="text-gray-600 mt-1 antialiased">
            Gérez les demandes de réinitialisation de mot de passe des clients de votre boutique NUMA
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="admin-card">
        <ResetRequestsClient initialRequests={requests} />
      </div>
    </div>
  );
}