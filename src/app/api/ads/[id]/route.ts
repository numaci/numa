import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSupabaseServer } from '@/lib/supabaseServer'

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

    // 2. Supprimer le fichier image du stockage Supabase si c'est une URL publique Supabase
    if (ad.imageUrl) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images'
        const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`
        if (ad.imageUrl.startsWith(prefix)) {
          const path = ad.imageUrl.replace(prefix, '')
          const { error } = await getSupabaseServer().storage.from(bucket).remove([path])
          if (error) {
            console.error('[AD_DELETE] supabase remove error', error.message)
          }
        }
      } catch (fileError) {
        console.error('[AD_DELETE] file cleanup error', fileError)
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
