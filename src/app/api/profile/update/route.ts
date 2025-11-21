import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").optional(),
  lastName: z.string().min(1, "Nom requis").optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().min(0).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Données invalides" }, { status: 400 });
    }

    const { firstName, lastName, email, phone, currentPassword, newPassword } = parsed.data;

    // Charger l'utilisateur actuel
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Si on veut changer email ou mot de passe, exiger currentPassword valide
    const wantsSensitiveChange = Boolean(newPassword) || (email && email !== user.email);
    if (wantsSensitiveChange) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
      }
    }

    // Préparer les données à mettre à jour
    const data: any = {};
    if (typeof firstName === "string") data.firstName = firstName;
    if (typeof lastName === "string") data.lastName = lastName;
    if (typeof email === "string") data.email = email;
    if (typeof phone === "string") data.phone = phone;

    if (newPassword) {
      data.password = await bcrypt.hash(newPassword, 12);
    }

    // Mettre à jour
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ message: "Profil mis à jour", user: updated });
  } catch (e: any) {
    // Si l'API a été appelée depuis le navigateur et qu'une erreur HTML est renvoyée, on renvoie un JSON d'erreur
    return NextResponse.json({ error: e?.message || "Erreur interne du serveur" }, { status: 500 });
  }
}
