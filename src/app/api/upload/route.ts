import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseServer } from '@/lib/supabaseServer';

// Force Node.js runtime (Buffer required)
export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    // Validate server envs early
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!hasUrl || !hasService) {
      return NextResponse.json(
        { error: 'Supabase env manquantes', missing: {
          NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'present' : 'missing',
          SUPABASE_SERVICE_ROLE_KEY: hasService ? 'present' : 'missing',
        } },
        { status: 500 }
      )
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
        console.warn(`Fichier ignoré (type ou taille invalide): ${file.name}`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;
      const storagePath = `${folder}/${fileName}`;

      const bytes = await file.arrayBuffer();
      const { error: uploadError } = await getSupabaseServer()
        .storage
        .from('images')
        .upload(storagePath, Buffer.from(bytes), {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[UPLOAD] Supabase upload error:', uploadError.message);
        // Stop early for single-file uploads to surface the cause
        if (files.length === 1) {
          return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }
        continue;
      }

      const { data } = getSupabaseServer()
        .storage
        .from('images')
        .getPublicUrl(storagePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Aucun fichier valide n'a pu être traité (vérifiez le bucket 'images' et les policies)." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      filePath: uploadedUrls[0], // Pour la compatibilité avec l'upload d'image unique
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}

// Configuration pour accepter les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
}