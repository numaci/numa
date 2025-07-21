import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadToImageKit(buffer: Buffer, fileName: string, folder: string = "receipts") {
  return imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });
} 