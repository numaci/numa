import { Button } from "@/components/ui/Button";

// Section newsletter
export default function NewsletterSection() {
  return (
    <section className="bg-indigo-600 text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Restez informé des nouveautés
        </h2>
        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
          Inscrivez-vous à notre newsletter pour recevoir en avant-première nos offres exclusives et nouveautés
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Votre adresse email"
            className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <Button className="bg-white text-indigo-600 hover:bg-gray-100">
            S'inscrire
          </Button>
        </div>
      </div>
    </section>
  );
} 