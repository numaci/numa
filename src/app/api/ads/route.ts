import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
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
    const data = await request.formData();
    const file: File | null = data.get('imageUrl') as unknown as File;
    const link: string | null = data.get('link') as string;

    if (!file) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const imagePath = path.join(process.cwd(), 'public/uploads/pub', filename);

    // Sauvegarder le fichier sur le serveur
    await writeFile(imagePath, buffer);

    const publicPath = `/uploads/pub/${filename}`;

    // Créer l'entrée dans la base de données
    const ad = await prisma.ad.create({
      data: {
        imageUrl: publicPath,
        link: link || null,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('[ADS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
