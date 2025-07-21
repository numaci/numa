"use client";

import { SessionProvider } from "next-auth/react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

// Provider pour NextAuth qui enveloppe l'application
// Ce composant permet d'accéder aux sessions d'authentification dans tous les composants enfants
// Il utilise le contexte React pour partager l'état d'authentification globalement
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartDrawerProvider>
        {children}
      </CartDrawerProvider>
    </SessionProvider>
  );
} 