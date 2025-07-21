"use client";

import { ReactNode } from "react";

// Types pour les props du composant
interface ProductFormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Composant de section pour le formulaire de produit
export default function ProductFormSection({ 
  title, 
  children, 
  className = "" 
}: ProductFormSectionProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6 mb-4 ${className}`}>
      <h2 className="text-xl font-bold text-orange-700 mb-6 flex items-center gap-2">
        {title}
      </h2>
      {children}
    </div>
  );
} 