// @ts-expect-error: NextAuthOptions may not be exported directly in some versions
import type { NextAuthOptions } from "next-auth";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Configuration des options d'authentification NextAuth
export const authOptions: NextAuthOptions = {
  // Utilisation de l'adaptateur Prisma pour la persistance des sessions
  adapter: PrismaAdapter(prisma),
  
  // Configuration des fournisseurs d'authentification
  providers: [
    // Fournisseur d'authentification par identifiants (email/mot de passe)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrPhone: { label: "Email ou numéro de téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      
      // Fonction d'autorisation personnalisée
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          return null;
        }

        try {
          // Détection email ou téléphone
          const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
          const phoneRegex = /^(\+|00)?\d{8,15}$/;
          const localPhoneRegex = /^\d{8}$/;
          const isEmail = emailRegex.test(credentials.emailOrPhone);
          const isPhone = phoneRegex.test(credentials.emailOrPhone.replace(/\s/g, "")) || localPhoneRegex.test(credentials.emailOrPhone.replace(/\s/g, ""));

          let user = null;
          if (isEmail) {
            user = await prisma.user.findUnique({ where: { email: credentials.emailOrPhone } });
          } else if (isPhone) {
            user = await prisma.user.findFirst({ where: { phone: credentials.emailOrPhone.replace(/\s/g, "") } });
          }

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            image: user.image
          };
        } catch (error: unknown) {
          return null;
        }
      }
    })
  ],

  // Configuration des sessions
  session: {
    strategy: "jwt", // Utilisation de JWT pour les sessions
  },

  // Configuration des callbacks
  callbacks: {
    // Callback appelé lors de la création du JWT
    async jwt({ token, user }: { token: any; user?: User }) {
      // Ajout des informations utilisateur au token JWT
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
      }
      return token;
    },

    // Callback appelé lors de la récupération de la session
    async session({ session, token }: { session: Session; token: any }) {
      // Ajout des informations du token à la session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },

    // Callback de redirection après connexion/déconnexion
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirection vers le dashboard admin si l'utilisateur est admin
      if (url.startsWith("/admin")) {
        return url;
      }
      // Redirection vers la page des produits pour les utilisateurs normaux
      return `${baseUrl}/products`;
    }
  },

  // Configuration des pages personnalisées
  pages: {
    signIn: "/admin/login", // Page de connexion personnalisée
    error: "/admin/login", // Page d'erreur
  },

  // Configuration de sécurité
  secret: process.env.NEXTAUTH_SECRET,
  
  // Mode de débogage en développement
  debug: process.env.NODE_ENV === "development",
}; 