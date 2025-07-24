import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.whatsappConfig.delete({ where: { id } });
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/admin/whatsapp`);
} 