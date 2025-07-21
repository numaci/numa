// Interface pour les props d'un avantage
interface AdvantageCardProps {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

// Carte d'affichage d'un avantage
export default function AdvantageCard({ icon, title, description, bgColor }: AdvantageCardProps) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 mx-auto mb-4 ${bgColor} rounded-full flex items-center justify-center`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
} 