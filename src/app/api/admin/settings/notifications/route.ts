import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CONFIG_ID = 'order_email';

export async function GET() {
  const config = await prisma.notificationConfig.findUnique({ where: { id: CONFIG_ID } });
  return NextResponse.json({ email: config?.email || '', senderEmail: config?.senderEmail || '' });
}

export async function POST(request: NextRequest) {
  const { email, senderEmail } = await request.json();
  if (email && typeof email !== 'string') {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }
  if (senderEmail && typeof senderEmail !== 'string') {
    return NextResponse.json({ error: 'Expéditeur invalide' }, { status: 400 });
  }
  await prisma.notificationConfig.upsert({
    where: { id: CONFIG_ID },
    update: { ...(email ? { email } : {}), ...(senderEmail !== undefined ? { senderEmail } : {}) },
    create: { id: CONFIG_ID, email: email || '', senderEmail: senderEmail || '' },
  });
  return NextResponse.json({ success: true });
} 