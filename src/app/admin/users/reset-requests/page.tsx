import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ResetRequestsClient from "./ResetRequestsClient";

export default async function ResetRequestsPage() {
  // Récupérer toutes les demandes en attente
  const requests = await prisma.passwordResetRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
    },
  });

  // Passer la liste à un composant client pour gestion dynamique
  return <ResetRequestsClient initialRequests={requests} />;
} 