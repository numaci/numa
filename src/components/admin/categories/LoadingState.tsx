"use client";

// Types pour les props du composant
interface LoadingStateProps {
  message?: string;
}

// Composant pour l'état de chargement des catégories
export default function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-500">{message}</div>
      </div>
    </div>
  );
} 