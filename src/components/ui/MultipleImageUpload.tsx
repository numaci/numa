'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Plus } from 'lucide-react'
import { Button } from './Button'
import {
  upload as imagekitUpload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

interface MultipleImageUploadProps {
  onImagesChange: (urls: string[], publicIds: string[]) => void
  currentImages?: string[]
  folder?: string
  className?: string
  disabled?: boolean
  maxImages?: number
}

export function MultipleImageUpload({
  onImagesChange,
  currentImages = [],
  folder = 'e-commerce',
  className = '',
  disabled = false,
  maxImages = 5
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(currentImages)
  const [publicIds, setPublicIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }

    // Validation de la taille (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximale : 5MB')
      return
    }

    // Validation du nombre d'images
    if (images.length >= maxImages) {
      setError(`Nombre maximum d'images atteint (${maxImages})`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // 1. Récupérer les paramètres d'authentification ImageKit
      const res = await fetch('/api/upload-auth');
      if (!res.ok) throw new Error("Erreur d'authentification ImageKit");
      const { signature, expire, token, publicKey } = await res.json();

      // 2. Uploader le fichier avec le SDK ImageKit
      const uploadResponse = await imagekitUpload({
        file,
        fileName: file.name,
        token,
        signature,
        expire,
        publicKey,
        folder,
        onProgress: (event) => {},
      });

      // Ajouter la nouvelle image
      const newImages = [...images, uploadResponse.url]
      const newPublicIds = [...publicIds, uploadResponse.fileId || uploadResponse.fileId || ""]
      setImages(newImages)
      setPublicIds(newPublicIds)
      onImagesChange(newImages, newPublicIds)

    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        setError("Upload annulé")
      } else if (error instanceof ImageKitInvalidRequestError) {
        setError("Requête non valide")
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError("Erreur réseau")
      } else if (error instanceof ImageKitServerError) {
        setError("Erreur serveur")
      } else {
        setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      }
    } finally {
      setIsUploading(false)
    }
  }, [images, publicIds, onImagesChange, folder, maxImages])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPublicIds = publicIds.filter((_, i) => i !== index)
    
    setImages(newImages)
    setPublicIds(newPublicIds)
    onImagesChange(newImages, newPublicIds)
  }, [images, publicIds, onImagesChange])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {images.length < maxImages && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragOver 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <div className="space-y-2">
            <Plus className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Ajouter une image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP ou GIF jusqu'à 5MB
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/{maxImages} images
              </p>
            </div>
          </div>

          {/* Indicateur de chargement */}
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Boutons d'action */}
      {images.length < maxImages && !disabled && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Ajouter une image
          </Button>
        </div>
      )}
    </div>
  )
} 