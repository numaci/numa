"use client";

import { ReactNode } from "react";

// Types pour les props du composant
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

// Composant de champ de formulaire
export default function FormField({ 
  label, 
  name, 
  error, 
  required = false, 
  children, 
  className = "" 
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
} 