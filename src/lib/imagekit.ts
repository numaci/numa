import ImageKit from "imagekit";

if (
  !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
  !process.env.IMAGEKIT_PRIVATE_KEY ||
  !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
) {
  throw new Error("ImageKit environment variables are not set. Please check your .env.local file.");
}

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function uploadToImageKit(buffer: Buffer, fileName: string, folder: string = "receipts") {
  return imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });
} 