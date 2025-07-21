import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Route API NextAuth qui gère toutes les requêtes d'authentification
// Le paramètre [...nextauth] permet de capturer toutes les routes d'authentification
const handler = NextAuth(authOptions);

// Export des méthodes GET et POST pour NextAuth
export { handler as GET, handler as POST }; 