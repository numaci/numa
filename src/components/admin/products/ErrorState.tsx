"use client";

// Types pour les props du composant
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

// Composant d'état d'erreur
export default function ErrorState({ 
  error, 
  onRetry, 
  retryText = "Réessayer" 
}: ErrorStateProps) {
  return (
    <div className="p-8 text-center">
      {/* Icône d'erreur */}
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Message d'erreur */}
      <p className="text-red-600 mb-4 antialiased">{error}</p>

      {/* Bouton de retry */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="admin-button admin-button-primary"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}