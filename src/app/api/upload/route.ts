import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedUrls = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
        console.warn(`Fichier ignoré (type ou taille invalide): ${file.name}`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;
      
      const bytes = await file.arrayBuffer();
      await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

      uploadedUrls.push(`/uploads/${fileName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier valide n\'a pu être traité.' }, { status: 400 });
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