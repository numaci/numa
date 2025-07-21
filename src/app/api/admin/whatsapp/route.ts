import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const whatsappConfigs = await prisma.whatsappConfig.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      whatsappConfigs: whatsappConfigs
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des configurations WhatsApp:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des configurations WhatsApp" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Correction : lire les données du formulaire HTML
    const form = await request.formData();
    const number = form.get("number")?.toString().trim();
    const type = form.get("type")?.toString().trim();
    const label = form.get("label")?.toString().trim() || null;

    if (!number || !type) {
      return NextResponse.json({ error: "Numéro et type requis" }, { status: 400 });
    }

    const whatsappConfig = await prisma.whatsappConfig.create({
      data: {
        number,
        type,
        label,
        isActive: true,
      },
    });

    // Redirige vers la page admin après ajout
    const origin = request.headers.get("origin") || "/admin/whatsapp";
    return NextResponse.redirect(`${origin}/admin/whatsapp`);

  } catch (error) {
    console.error("Erreur lors de la création de la configuration WhatsApp:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la configuration WhatsApp" }, { status: 500 });
  }
} 