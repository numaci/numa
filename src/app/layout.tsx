import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ReactNode } from "react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

// Configuration des polices Google Fonts
// Geist Sans pour le texte principal et Geist Mono pour le code
const geistSans = Geist({
  variable: "--font-geist-sans", // Variable CSS pour utiliser la police
  subsets: ["latin"], // Sous-ensemble de caractères (latin uniquement)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Variable CSS pour la police monospace
  subsets: ["latin"],
});

// Métadonnées de l'application pour le SEO et les réseaux sociaux
export const metadata: Metadata = {
  title: "E-commerce - Boutique en ligne", // Titre de la page
  description: "Votre boutique en ligne moderne avec administration complète", // Description pour les moteurs de recherche
  keywords: ["e-commerce", "boutique", "achat", "vente", "produits"], // Mots-clés SEO
  authors: [{ name: "Votre équipe" }], // Auteur du site
};

// Configuration viewport séparée
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Layout principal de l'application Next.js
// Ce composant enveloppe toutes les pages et définit la structure HTML de base
export default function RootLayout({
  children, // Contenu des pages qui sera injecté ici
}: Readonly<{
  children: React.ReactNode; // Type TypeScript pour les enfants React
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          defer
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
