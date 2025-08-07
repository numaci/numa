import React from "react";
import { FiUsers, FiShoppingCart, FiDollarSign, FiBarChart2 } from "react-icons/fi";

// Interface TypeScript pour les propriétés du composant StatCardsGrid
// Définit la structure des statistiques passées en props
interface StatCardsGridProps {
  stats: {
    totalUsers: number;        // Nombre total d'utilisateurs
    todayClients: number;      // Nouveaux clients aujourd'hui
    monthlyClients: number;    // Nouveaux clients ce mois
    totalOrders: number;       // Nombre total de commandes
    todayOrders: number;       // Commandes aujourd'hui
    monthlyOrders: number;     // Commandes ce mois
    totalRevenue: number;      // Chiffre d'affaires total
    todayEarnings: number;     // Gains aujourd'hui
    monthlyEarnings: number;   // Gains ce mois
    totalProducts: number;     // Nombre total de produits
  };
}

// Objet contenant les icônes SVG pour chaque type de statistique
// Utilise des icônes avec la palette NUMA
const icons = {
  clients: <FiUsers size={32} className="text-gray-700" />,
  orders: <FiShoppingCart size={32} className="text-gray-700" />,
  earnings: <FiDollarSign size={32} className="text-gray-700" />,
  balance: <FiBarChart2 size={32} className="text-white" />,
};

// Composant Card réutilisable pour afficher une statistique
// Affiche un titre, une valeur principale et deux valeurs secondaires (gauche/droite)
const Card = ({ title, value, leftLabel, leftValue, rightLabel, rightValue, icon, accent }: any) => (
  <div className={`admin-card ${accent ? "bg-black text-white" : ""}`}>
    <div className="flex justify-between items-start">
      <div>
        <div className={`uppercase text-xs font-semibold tracking-wider mb-2 antialiased ${
          accent ? "text-gray-300" : "text-gray-600"
        }`}>
          {title}
        </div>
        <div className={`text-3xl font-semibold tracking-tight antialiased ${
          accent ? "text-white" : "text-black"
        }`}>
          {value}
        </div>
      </div>
      <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${
        accent ? "bg-white bg-opacity-20" : "bg-gray-100"
      }`}>
        {icon}
      </div>
    </div>
    {(leftLabel || rightLabel) && (
      <div className={`flex justify-between items-center border-t mt-4 pt-4 text-xs ${
        accent ? "border-gray-600 text-gray-300" : "border-gray-200 text-gray-600"
      }`}>
        <div>
          {leftLabel && <span className="block uppercase text-[10px] font-bold antialiased">{leftLabel}</span>}
          {leftValue && <span className="font-semibold text-base antialiased">{leftValue}</span>}
        </div>
        <div className="text-right">
          {rightLabel && <span className="block uppercase text-[10px] font-bold antialiased">{rightLabel}</span>}
          {rightValue && <span className="font-semibold text-base antialiased">{rightValue}</span>}
        </div>
      </div>
    )}
  </div>
);

// Composant principal StatCardsGrid
// Affiche une grille de 4 cartes de statistiques pour le dashboard admin
const StatCardsGrid: React.FC<StatCardsGridProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <Card
      title="Clients"
      value={stats.totalUsers}
      leftLabel="Aujourd'hui"
      leftValue={stats.todayClients}
      rightLabel="Ce mois"
      rightValue={stats.monthlyClients}
      icon={icons.clients}
    />
    <Card
      title="Commandes"
      value={stats.totalOrders}
      leftLabel="Aujourd'hui"
      leftValue={stats.todayOrders}
      rightLabel="Ce mois"
      rightValue={stats.monthlyOrders}
      icon={icons.orders}
    />
    <Card
      title="Gains"
      value={stats.totalRevenue.toLocaleString("fr-FR", { style: "currency", currency: "XOF" }).replace("F", "FCFA")}
      leftLabel="Aujourd'hui"
      leftValue={stats.todayEarnings.toLocaleString("fr-FR", { style: "currency", currency: "XOF" }).replace("F", "FCFA")}
      rightLabel="Ce mois"
      rightValue={stats.monthlyEarnings.toLocaleString("fr-FR", { style: "currency", currency: "XOF" }).replace("F", "FCFA")}
      icon={icons.earnings}
    />
    {/* Carte spéciale du solde (accent) */}
    <Card
      title="Solde actuel"
      value={"981 340 FCFA"}
      icon={icons.balance}
      accent
    />
  </div>
);

export default StatCardsGrid; 