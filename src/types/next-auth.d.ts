// Supprimer/commenter toutes les variables non utilisées (ex: NextAuth)

// Extension des types NextAuth pour inclure nos propriétés personnalisées
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      role: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    image?: string;
  }
}

// Extension des types JWT pour inclure nos propriétés personnalisées
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
  }
} 