import AdvantageCard from "./AdvantageCard";

// Section des avantages de la boutique
export default function AdvantagesSection() {
  const advantages = [
    {
      icon: "🚚",
      title: "Livraison rapide",
      description: "Livraison gratuite dès 50€ d'achat",
      bgColor: "bg-indigo-100"
    },
    {
      icon: "🛡️",
      title: "Garantie qualité",
      description: "Produits testés et garantis",
      bgColor: "bg-green-100"
    },
    {
      icon: "💬",
      title: "Service client",
      description: "Support 7j/7 disponible",
      bgColor: "bg-blue-100"
    },
    {
      icon: "↩️",
      title: "Retours faciles",
      description: "30 jours pour changer d'avis",
      bgColor: "bg-yellow-100"
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir notre boutique ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nous nous engageons à vous offrir la meilleure expérience d'achat possible
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <AdvantageCard
              key={index}
              icon={advantage.icon}
              title={advantage.title}
              description={advantage.description}
              bgColor={advantage.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 