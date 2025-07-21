import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  const ad = await prisma.ad.update({ where: { id: params.id }, data });
  return NextResponse.json(ad);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.ad.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 