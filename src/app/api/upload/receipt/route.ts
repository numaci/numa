import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || typeof file !== 'object' || typeof file.type !== 'string') {
      return NextResponse.json({ error: "Aucun fichier image valide fourni" }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Seules les images sont autorisées" }, { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier est trop volumineux (max 5MB)" }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const fileName = `receipt_${session.user.id}_${Date.now()}.jpg`;

    // Upload sur ImageKit
    const uploadResult = await uploadToImageKit(buffer, fileName, "receipts");

    // Retourner l'URL publique ImageKit
    return NextResponse.json({ 
      success: true, 
      imageUrl: uploadResult.url,
      message: "Image uploadée avec succès sur ImageKit"
    });

  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
} 