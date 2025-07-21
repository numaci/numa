import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { emailOrPhone, password } = await req.json();
  if (!emailOrPhone || !password) {
    return NextResponse.json({ message: "Email/Numéro et mot de passe requis" }, { status: 400 });
  }
  // Détection email ou téléphone
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const phoneRegex = /^([+0-9\s]{8,15})$/;
  const isEmail = emailRegex.test(emailOrPhone);
  const isPhone = phoneRegex.test(emailOrPhone.replace(/\s/g, ""));

  let supplier = null;
  if (isEmail) {
    supplier = await prisma.supplier.findUnique({ where: { email: emailOrPhone } });
  } else if (isPhone) {
    supplier = await prisma.supplier.findFirst({ where: { phone: emailOrPhone.replace(/\s/g, "") } });
  }
  if (!supplier) {
    return NextResponse.json({ message: "Identifiants invalides" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, supplier.password);
  if (!valid) {
    return NextResponse.json({ message: "Identifiants invalides" }, { status: 401 });
  }
  return NextResponse.json({ message: "Connexion réussie", supplierId: supplier.id });
} 