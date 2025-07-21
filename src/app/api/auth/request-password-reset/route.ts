import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { value } = await req.json();
    if (!value) {
      return NextResponse.json({ error: "Champ requis" }, { status: 400 });
    }
    // Détecter email ou téléphone
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phoneRegex = /^([+0-9\s]{8,15})$/;
    let user = null;
    if (emailRegex.test(value)) {
      user = await prisma.user.findUnique({ where: { email: value.toLowerCase() } });
    } else if (phoneRegex.test(value.replace(/\s/g, ""))) {
      user = await prisma.user.findFirst({ where: { phone: value.replace(/\s/g, "") } });
    }
    if (user) {
      // Créer la demande seulement si l'utilisateur existe
      await prisma.passwordResetRequest.create({
        data: {
          userId: user.id,
        },
      });
    }
    // Toujours retourner succès pour ne pas révéler si l'utilisateur existe
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
} 