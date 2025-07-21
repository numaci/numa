import { PrismaClient } from "@prisma/client";

// Variable globale pour stocker l'instance Prisma
// Cette déclaration permet d'éviter la création de multiples connexions en développement
declare global {
  var prisma: PrismaClient | undefined;
}

// Création de l'instance Prisma Client
// Cette configuration optimise les performances en réutilisant la même connexion
export const prisma = globalThis.prisma || new PrismaClient({
  // log: process.env.NODE_ENV === "development" 
  //   ? ["query", "error", "warn"]  // En développement : logs détaillés pour le debug
  //   : ["error"],                  // En production : uniquement les erreurs
});

// En développement, on stocke l'instance dans la variable globale
// Cela évite la création de multiples connexions lors du hot reload de Next.js
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
} 