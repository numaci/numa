import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { welcomeMessageSent: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
} 