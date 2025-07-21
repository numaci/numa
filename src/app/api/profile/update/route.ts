import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const userId = session.user.id;
  const { firstName, lastName, email, phone, newPassword, currentPassword } = await req.json();

  // Récupérer l'utilisateur actuel
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Vérifier le mot de passe actuel pour les changements sensibles
  if ((email && email !== user.email) || (newPassword && newPassword.length > 0)) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Mot de passe actuel requis pour modifier l'email ou le mot de passe." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
    }
  }

  // Préparer les données à mettre à jour
  const updateData: any = {
    firstName,
    lastName,
    email,
    phone
  };
  if (newPassword && newPassword.length > 0) {
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  // Nettoyer les champs undefined
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === "") {
      delete updateData[key];
    }
  });

  try {
    await prisma.user.update({ where: { id: userId }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Email ou téléphone déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
} 