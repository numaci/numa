import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mettre à jour une annonce (ads) - compatible Next.js 15 (params asynchrone)
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await req.json();
  const ad = await prisma.ad.update({ where: { id }, data });
  return NextResponse.json(ad);
}

// Supprimer une annonce (ads) - compatible Next.js 15 (params asynchrone)
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 