import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Types pour les réponses Cloudinary
export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

// Fonction pour uploader une image
export async function uploadImage(
  file: Buffer,
  folder: string = 'e-commerce',
  options: Record<string, unknown> = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Redimensionnement automatique
          { quality: 'auto', fetch_format: 'auto' }   // Optimisation automatique
        ],
        ...options
      },
      (error, _result) => {
        if (error) {
          reject(error)
        } else if (_result) {
          resolve(_result as CloudinaryUploadResult)
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    uploadStream.end(file)
  })
}

// Fonction pour supprimer une image
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

// Fonction pour générer une URL optimisée
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width: options.width, height: options.height, crop: options.crop },
      { quality: options.quality || 'auto', fetch_format: options.format || 'auto' }
    ]
  })
}

export default cloudinary 