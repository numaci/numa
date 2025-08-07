import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || '/';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[UPLOAD_PROXY] Uploading file: ${file.name} to folder: ${folder}`);

    const response = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true,
    });

    console.log('[UPLOAD_PROXY] Upload successful:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('[UPLOAD_PROXY] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Upload failed', details: errorMessage }, { status: 500 });
  }
}
