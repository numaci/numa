"use client";

import { SessionProvider } from "next-auth/react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import { Toaster } from "react-hot-toast";

// Ce composant centralise tous les providers de l'application.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartDrawerProvider>
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </CartDrawerProvider>
    </SessionProvider>
  );
}