import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Route API pour créer un utilisateur administrateur initial
// Cette route ne devrait être utilisée qu'une seule fois lors de la première installation
export async function POST(request: NextRequest) {
  try {
    // Vérification si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN"
      }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Un administrateur existe déjà" },
        { status: 400 }
      );
    }

    // Récupération des données de la requête
    const { email, password, firstName, lastName } = await request.json();

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création de l'utilisateur administrateur
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "ADMIN",
        emailVerified: new Date(), // Marquer comme vérifié
      }
    });

    // Retour de la réponse (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = adminUser;

    return NextResponse.json(
      {
        message: "Administrateur créé avec succès",
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 