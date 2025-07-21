import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: récupérer le message de bienvenue global
export async function GET() {
  const config = await prisma.whatsappConfig.findFirst({ where: { type: 'welcome' } });
  return NextResponse.json({ message: config?.welcomeMessage || '' });
}

// POST: mettre à jour le message de bienvenue global
export async function POST(request: Request) {
  const { message } = await request.json();
  let config = await prisma.whatsappConfig.findFirst({ where: { type: 'welcome' } });
  if (!config) {
    config = await prisma.whatsappConfig.create({ data: { type: 'welcome', number: '', welcomeMessage: message } });
  } else {
    await prisma.whatsappConfig.update({ where: { id: config.id }, data: { welcomeMessage: message } });
  }
  return NextResponse.json({ success: true });
} 