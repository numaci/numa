"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

// Types pour les props du composant
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

// Composant pour l'en-tête de page des catégories
export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-orange-800">{title}</h1>
        {subtitle && (
          <p className="text-orange-400">{subtitle}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2 text-orange-200" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
} 