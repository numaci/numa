import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.whatsappConfig.delete({ where: { id: params.id } });
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/admin/whatsapp`);
} 