import 'next-auth';

// Extension des types NextAuth pour inclure nos propriétés personnalisées
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      role: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    name?: string | null;
    image?: string | null;
  }
}

// Extension des types JWT pour inclure nos propriétés personnalisées
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
}