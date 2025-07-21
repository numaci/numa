import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." }, { status: 400 });
    }

    // Récupérer l'utilisateur connecté (NextAuth ou custom)
    let user = null;
    let userId = null;
    // NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Custom user (localStorage userId envoyé dans un header ou cookie)
      const userIdHeader = req.headers.get("x-user-id") || req.cookies.get("userId")?.value;
      if (userIdHeader) userId = userIdHeader;
    }
    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non authentifié." }, { status: 401 });
    }
    user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Utilisateur introuvable ou sans mot de passe." }, { status: 404 });
    }
    // Vérifier l'ancien mot de passe
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
    }
    // Mettre à jour le mot de passe
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
} 