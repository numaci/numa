"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "@/app/admin/login/AdminSidebar";
import AdminHeader from "@/app/admin/login/AdminHeader";

// Layout principal de l'administration
// Ce composant gère la structure commune à toutes les pages admin
// Il inclut la vérification d'authentification et la protection des routes
export default function AdminLayout({
  children, // Contenu spécifique de chaque page admin
}: {
  children: React.ReactNode;
}) {
  // Hook NextAuth pour récupérer les informations de session
  const { data: session, status } = useSession();
  const pathname = usePathname(); // URL actuelle pour déterminer la page
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages qui ne nécessitent pas d'authentification
  const isLoginPage = pathname === "/admin/login";
  const isSetupPage = pathname === "/admin/setup";

  // Si c'est la page de connexion ou de setup, on affiche directement les enfants
  // sans vérification d'authentification
  if (isLoginPage || isSetupPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  // Affichage du chargement pendant la vérification de la session
  // NextAuth vérifie automatiquement la validité du token
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium text-gray-700 antialiased">Chargement...</div>
      </div>
    );
  }

  // Redirection si non authentifié (normalement géré par le middleware)
  // On ne rend rien ici pour éviter le flash de contenu avant la redirection
  if (status === "unauthenticated") {
    return null; // Le middleware gère la redirection, ici on ne rend rien pour éviter le flash de contenu
  }

  // Vérification du rôle admin pour les autres pages admin
  // Seuls les utilisateurs avec le rôle ADMIN peuvent accéder aux pages d'administration
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  // Layout principal pour les pages admin authentifiées
  return (
    <div className="admin-layout min-h-screen bg-white antialiased">
      {/* Sidebar desktop */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Wrapper principal du contenu, avec padding-left pour ne pas passer sous la sidebar */}
      <div className="md:pl-64 pl-0 transition-all duration-300 ease-in-out">
        <div className="flex flex-col overflow-visible">
          <AdminHeader onBurgerClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-visible p-6 max-w-screen-xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}