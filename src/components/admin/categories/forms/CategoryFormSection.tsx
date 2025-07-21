"use client";

import { ReactNode } from "react";

// Types pour les props du composant
interface CategoryFormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Composant de section pour le formulaire de catégorie
export default function CategoryFormSection({ 
  title, 
  children, 
  className = "" 
}: CategoryFormSectionProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6 ${className}`}>
      <h2 className="text-lg font-bold text-orange-800 mb-6">{title}</h2>
      {children}
    </div>
  );
} 