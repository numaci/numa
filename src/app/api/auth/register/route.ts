import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, password, firstName, lastName } = await request.json();

    // Validation des données
    if (!emailOrPhone || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Détection email ou téléphone
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phoneRegex = /^(\+|00)?\d{8,15}$/;
    const localPhoneRegex = /^\d{8}$/;
    const isEmail = emailRegex.test(emailOrPhone);
    const isPhone = phoneRegex.test(emailOrPhone.replace(/\s/g, "")) || localPhoneRegex.test(emailOrPhone.replace(/\s/g, ""));
    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: "Format d'email ou de numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 4 caractères" },
        { status: 400 }
      );
    }

    // Vérification si l'email ou le téléphone existe déjà
    let existingUser = null;
    if (isEmail) {
      existingUser = await prisma.user.findUnique({ where: { email: emailOrPhone } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Un compte avec cet email existe déjà" },
          { status: 409 }
        );
      }
    } else if (isPhone) {
      existingUser = await prisma.user.findFirst({ where: { phone: emailOrPhone.replace(/\s/g, "") } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Un compte avec ce numéro existe déjà" },
          { status: 409 }
        );
      }
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Construction stricte de l'objet safeData
    const safeData: any = {};
    if (isEmail) safeData.email = emailOrPhone;
    if (isPhone) safeData.phone = emailOrPhone.replace(/\s/g, "");
    safeData.password = hashedPassword;
    safeData.firstName = firstName;
    safeData.lastName = lastName;
    safeData.role = "USER";

    console.log("safeData avant création:", safeData);

    const user = await prisma.user.create({
      data: safeData,
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

    return NextResponse.json(
      { 
        message: "Compte créé avec succès",
        user,
        firstName: user.firstName,
        success: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 