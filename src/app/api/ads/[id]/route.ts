import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse('Ad ID is required', { status: 400 });
    }

    // 1. Trouver la publicité pour obtenir le chemin de l'image
    const ad = await prisma.ad.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!ad) {
      return new NextResponse('Ad not found', { status: 404 });
    }

    // 2. Supprimer le fichier image du serveur
    if (ad.imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', ad.imageUrl);
      try {
        await unlink(imagePath);
      } catch (fileError) {
        console.error(`Failed to delete image file: ${imagePath}`, fileError);
        // On ne bloque pas la suppression de l'entrée DB même si le fichier n'existe pas
      }
    }

    // 3. Supprimer l'entrée de la base de données
    await prisma.ad.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error('[AD_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
