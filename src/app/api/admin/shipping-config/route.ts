import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Récupérer la config active pour Sikasso
export async function GET() {
  const config = await prisma.shippingConfig.findFirst({
    where: { city: "Sikasso", isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ config });
}

// POST: Mettre à jour la config
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const form = await request.formData();
  const city = form.get("city")?.toString().trim() || "Sikasso";
  const freeThreshold = parseInt(form.get("freeThreshold")?.toString() || "10000", 10);
  const fee = parseInt(form.get("fee")?.toString() || "500", 10);

  // Désactiver l'ancienne config active pour cette ville
  await prisma.shippingConfig.updateMany({
    where: { city, isActive: true },
    data: { isActive: false },
  });

  // Créer la nouvelle config
  const newConfig = await prisma.shippingConfig.create({
    data: {
      city,
      freeThreshold,
      fee,
      isActive: true,
    },
  });

  // Rediriger vers la page admin shipping
  const origin = request.headers.get("origin") || "/admin/shipping";
  return NextResponse.redirect(`${origin}/admin/shipping`);
} 