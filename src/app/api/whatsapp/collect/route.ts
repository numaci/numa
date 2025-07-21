import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone } = await request.json();
  if (!phone || typeof phone !== 'string' || phone.length < 8) {
    return NextResponse.json({ error: 'Numéro invalide' }, { status: 400 });
  }
  const exists = await prisma.whatsappLead.findFirst({ where: { phone } });
  if (exists) {
    return NextResponse.json({ success: true }); // déjà enregistré, on ferme le formulaire côté client
  }
  await prisma.whatsappLead.create({ data: { phone } });
  return NextResponse.json({ success: true });
} 