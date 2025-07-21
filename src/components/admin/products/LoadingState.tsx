"use client";

// Types pour les props du composant
interface LoadingStateProps {
  message?: string;
}

// Composant d'état de chargement
export default function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  );
} 