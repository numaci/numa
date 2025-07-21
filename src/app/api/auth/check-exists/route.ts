import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { value, type } = await request.json();
  if (!value || (type !== 'email' && type !== 'phone')) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }
  const exists = await prisma.user.findFirst({ where: { [type]: value } });
  return NextResponse.json({ exists: !!exists });
} 