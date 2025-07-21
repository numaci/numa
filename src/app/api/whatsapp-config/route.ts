import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.whatsappConfig.findFirst({
    where: { isActive: true, type: "order" },
    orderBy: { createdAt: "desc" },
  });
  let whatsappNumber = "";
  if (config) {
    whatsappNumber = config.number.replace(/\D/g, "");
    if (whatsappNumber.length <= 9 && !whatsappNumber.startsWith("223")) {
      whatsappNumber = `223${whatsappNumber}`;
    }
  }
  return NextResponse.json({ whatsappNumber });
} 