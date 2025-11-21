import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createOrUpdateContact, sendWelcomeEmail } from "@/lib/brevo";

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  phone: z.string().min(8, "Numéro de téléphone invalide").optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
}).refine((data) => data.email || data.phone, {
  message: "Email ou numéro de téléphone requis",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = registerSchema.parse(body);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email || undefined },
          { phone: validatedData.phone || undefined }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email ou ce numéro existe déjà" },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: "USER"
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Tâches post-inscription: Brevo + email de bienvenue (non bloquant)
    if (user.email) {
      // Exécuter en arrière-plan mais en capturant les erreurs
      (async () => {
        try {
          await createOrUpdateContact(user.email!, user.firstName ?? undefined, user.lastName ?? undefined);
        } catch (e) {
          console.warn("Brevo contact error:", e);
        }
        try {
          const res = await sendWelcomeEmail(user.email!, user.firstName ?? undefined);
          if (res.ok) {
            await prisma.user.update({
              where: { id: user.id },
              data: { welcomeMessageSent: true }
            });
          }
        } catch (e) {
          console.warn("Welcome email error:", e);
        }
      })();
    }

    return NextResponse.json({
      message: "Compte créé avec succès",
      user
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
