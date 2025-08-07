import 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: string;
  }
}

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