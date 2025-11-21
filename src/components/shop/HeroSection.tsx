import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Section hero de la page d'accueil
export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez notre
            <span className="block text-yellow-300">collection exclusive</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
            Des produits de qualité sélectionnés avec soin pour répondre à tous vos besoins.
            Livraison rapide et service client exceptionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <Link href="/products" prefetch={true}>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                🛍️ Voir tous les produits
              </Button>
            </Link>
            <Link href="/deals">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-indigo-600">
                🎉 Promotions
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-300 opacity-20 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full"></div>
      </div>
    </section>
  );
} 