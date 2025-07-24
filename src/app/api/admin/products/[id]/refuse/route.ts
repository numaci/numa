import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }
  const { comment } = await req.json();
  if (!comment || !comment.trim()) {
    return NextResponse.json({ error: 'Commentaire obligatoire' }, { status: 400 });
  }
  try {
    await prisma.product.update({
      where: { id },
      data: { status: 'REFUSED', refuseComment: comment },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors du refus' }, { status: 500 });
  }
} 