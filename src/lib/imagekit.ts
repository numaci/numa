import ImageKit from "imagekit";

const hasImagekitEnv = Boolean(
  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
);

// N'initialise pas si les variables ne sont pas présentes pour éviter les erreurs au build
export const imagekit: ImageKit | null = hasImagekitEnv
  ? new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
    })
  : null;

export async function uploadToImageKit(buffer: Buffer, fileName: string, folder: string = "receipts") {
  if (!imagekit) {
    throw new Error("ImageKit n'est pas configuré. Définissez NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY et NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.");
  }
  return imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });
}