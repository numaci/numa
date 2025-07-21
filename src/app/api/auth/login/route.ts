import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, phone, password } = await req.json();
    if ((!email && !phone) || !password) {
      return NextResponse.json({ error: "Email/téléphone et mot de passe requis." }, { status: 400 });
    }

    // Recherche par email ou téléphone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase() } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    // Connexion réussie
    return NextResponse.json({ success: true, userId: user.id, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
} 