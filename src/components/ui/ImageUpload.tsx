'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import {
  upload as imagekitUpload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void
  onRemove?: () => void
  currentImage?: string
  folder?: string
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  folder = 'e-commerce',
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }

    // Validation de la taille (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximale : 15MB')
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

      // Créer l'aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Appeler le callback avec les données
      onUpload(uploadResponse.url, uploadResponse.fileId || uploadResponse.fileId || "")

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
  }, [onUpload, folder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
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

  const handleRemove = useCallback(() => {
    setPreview(null)
    setError(null)
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onRemove])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone d'upload */}
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

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu"
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Cliquez pour sélectionner ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP ou GIF jusqu'à 15MB
              </p>
            </div>
          </div>
        )}

        {/* Indicateur de chargement */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Boutons d'action */}
      {!preview && !disabled && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Sélectionner une image
          </Button>
        </div>
      )}
    </div>
  )
} 