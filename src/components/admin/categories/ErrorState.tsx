"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

// Types pour les props du composant
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

// Composant pour l'état d'erreur des catégories
export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="text-red-600 mb-4">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
} 