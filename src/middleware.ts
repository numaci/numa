import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware pour protéger les routes d'administration
export default withAuth(
  // Fonction de vérification des autorisations
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = req.nextUrl.pathname === "/admin/login";
    const isSetupPage = req.nextUrl.pathname === "/admin/setup";
    
    // Ne pas protéger la page de login ni de setup
    if (isLoginPage || isSetupPage) {
      return NextResponse.next();
    }

    // Si c'est une route admin et que l'utilisateur n'est pas admin
    if (isAdminRoute && token?.role !== "ADMIN") {
      // Redirection vers la page de connexion avec un message d'erreur
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  },
  {
    // Configuration du middleware
    callbacks: {
      // Autoriser l'accès si l'utilisateur est authentifié
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuration des routes à protéger
export const config = {
  // Protection de toutes les routes commençant par /admin sauf /admin/login et /admin/setup
  matcher: ["/admin/:path((?!login|setup).*)"],
}; 