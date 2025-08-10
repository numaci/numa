"use client";

import { SessionProvider } from "next-auth/react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

// Ce composant centralise tous les providers de l'application.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartDrawerProvider>
        {children}
      </CartDrawerProvider>
    </SessionProvider>
  );
}