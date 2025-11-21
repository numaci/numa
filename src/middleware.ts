import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware pour protéger les routes d'administration
export default withAuth(
  // Fonction de vérification des autorisations
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isCheckoutRoute = req.nextUrl.pathname.startsWith("/checkout");
    const isAdminRoot = req.nextUrl.pathname === "/admin";
    const isLoginPage = req.nextUrl.pathname === "/admin/login";
    const isSetupPage = req.nextUrl.pathname === "/admin/setup";
    
    // Ne pas protéger la page de login ni de setup
    if (isLoginPage || isSetupPage) {
      return NextResponse.next();
    }

    // Si c'est une route admin et que l'utilisateur n'est pas connecté
    if (isAdminRoute && !token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "signin");
      return NextResponse.redirect(loginUrl);
    }

    // Si connecté mais pas ADMIN
    if (isAdminRoute && token?.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Si on visite /admin directement, router vers le dashboard ou la page de login
    if (isAdminRoot) {
      if (token?.role === "ADMIN") {
        const adminDashboardUrl = new URL("/admin/dashboard", req.url);
        return NextResponse.redirect(adminDashboardUrl);
      }
      const adminLoginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(adminLoginUrl);
    }

    // Si un ADMIN est connecté et visite des pages publiques, rediriger vers le dashboard admin
    const isPublicLanding = req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login";
    if (token && token.role === "ADMIN" && isPublicLanding) {
      const adminUrl = new URL("/admin/dashboard", req.url);
      return NextResponse.redirect(adminUrl);
    }

    // Protéger la caisse /checkout pour les utilisateurs non connectés
    if (isCheckoutRoute && !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", "checkout");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    // Configuration du middleware
    callbacks: {
      // Laisser passer, la logique de redirection est gérée ci-dessus
      authorized: () => true,
    },
  }
);

// Configuration des routes à protéger
export const config = {
  // Protection de toutes les routes commençant par /admin sauf /admin/login et /admin/setup
  matcher: [
    "/admin",
    "/admin/:path((?!login|setup).*)",
    "/checkout",
  ],
};