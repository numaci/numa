import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les publicités
export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error('[ADS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// POST - Créer une nouvelle publicité
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { imageUrl?: string; link?: string } | null
    if (!body || !body.imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    const ad = await prisma.ad.create({
      data: {
        imageUrl: body.imageUrl,
        link: body.link || null,
      },
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('[ADS_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
