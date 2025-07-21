"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Types pour les props du composant
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref: string;
  backText?: string;
}

// Composant pour l'en-tête de page
export default function PageHeader({
  title,
  subtitle,
  backHref,
  backText = "Retour",
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Bouton retour */}
      <Link
        href={backHref}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {backText}
      </Link>

      {/* Titre et sous-titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
} 