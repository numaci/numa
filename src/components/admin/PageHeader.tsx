"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

// Types pour les props du composant
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: React.ReactNode;
}

// Composant d'en-tête de page
export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  actionIcon = <Plus className="w-4 h-4 mr-2" />,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-extrabold text-orange-700 drop-shadow mb-1">{title}</h1>
        {subtitle && <p className="text-orange-400 font-medium">{subtitle}</p>}
      </div>
      
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition text-lg"
        >
          <span className="mr-2 scale-125">{actionIcon}</span>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
