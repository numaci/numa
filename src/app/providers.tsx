"use client";

import { SessionProvider } from "next-auth/react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import { IKContext } from "imagekitio-react";

// Ce composant centralise tous les providers de l'application.
export function Providers({ children }: { children: React.ReactNode }) {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !urlEndpoint) {
    // Affiche une erreur claire si les variables d'environnement ne sont pas définies
    // Cela évite les erreurs cryptiques côté client.
    return (
      <div>
        <h1>Erreur de configuration ImageKit</h1>
        <p>Veuillez vérifier que NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY et NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT sont bien définis dans votre fichier .env.local</p>
      </div>
    );
  }

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
    >
      <SessionProvider>
        <CartDrawerProvider>
          {children}
        </CartDrawerProvider>
      </SessionProvider>
    </IKContext>
  );
}