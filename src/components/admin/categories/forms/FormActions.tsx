"use client";

import Link from "next/link";
import { Save } from "lucide-react";

// Types pour les props du composant
interface FormActionsProps {
  loading: boolean;
  loadingText?: string;
  submitText?: string;
  cancelHref: string;
  cancelText?: string;
  error?: string;
}

// Composant pour les actions du formulaire
export default function FormActions({
  loading,
  loadingText = "Sauvegarde...",
  submitText = "Sauvegarder",
  cancelHref,
  cancelText = "Annuler",
  error,
}: FormActionsProps) {
  return (
    <div className="space-y-4">
      {/* Erreur générale */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4">
        <Link
          href={cancelHref}
          className="px-6 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
        >
          {cancelText}
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4 mr-2 text-orange-200" />
          {loading ? loadingText : submitText}
        </button>
      </div>
    </div>
  );
} 