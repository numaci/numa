'use client';

// Removed ImageKit imports as we're switching to local uploads
import { useRef, useState } from "react";
import { Button } from "./Button";
import { X } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  onUpload,
  value,
  folder = "uploads",
  className
}: ImageUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = new AbortController();

  /**
   * Handles local image upload to the server.
   */
  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Veuillez sélectionner un fichier à téléverser");
      return;
    }

    const file = fileInput.files[0];
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder || '/');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const uploadResponse = await response.json();
      console.log("Upload response:", uploadResponse);

      const url: string | undefined = Array.isArray(uploadResponse?.urls) ? uploadResponse.urls[0] : uploadResponse?.filePath
      if (url) onUpload(url)
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors du téléversement: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = async () => {
    const url = value
    onUpload("")
    if (!url) return
    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
    } catch (e) {
      // silent fail, UI already cleared
      console.error('Delete failed', e)
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleUpload}
          />
          <div className="text-center">
            <Button 
              type="button" 
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              {isUploading ? "Téléversement..." : "Choisir une image"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, WEBP, GIF, AVIF jusqu'à 15MB
            </p>
            {isUploading && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Progression: {Math.round(progress)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}