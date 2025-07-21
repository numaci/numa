import { redirect } from "next/navigation";

// Page d'accueil principale - Redirection vers la boutique client
export default function HomePage() {
  // Redirection automatique vers la boutique
  redirect("/products");
}
