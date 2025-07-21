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

const cardStyles = "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col justify-between min-w-[260px] transition-transform hover:scale-[1.03] hover:shadow-2xl border border-orange-100";

// Objet contenant les icônes SVG pour chaque type de statistique
// Utilise des icônes personnalisées avec des couleurs spécifiques
const icons = {
  clients: <FiUsers size={32} className="text-amber-500" />,
  orders: <FiShoppingCart size={32} className="text-orange-500" />,
  earnings: <FiDollarSign size={32} className="text-green-500" />,
  balance: <FiBarChart2 size={32} className="text-cyan-500" />,
};

// Composant Card réutilisable pour afficher une statistique
// Affiche un titre, une valeur principale et deux valeurs secondaires (gauche/droite)
const Card = ({ title, value, leftLabel, leftValue, rightLabel, rightValue, icon, accent }: any) => (
  <div className={cardStyles + (accent ? " bg-gradient-to-br from-amber-600 via-orange-400 to-amber-700 text-white" : "") }>
    <div className="flex justify-between items-start">
      <div>
        <div className={accent ? "uppercase text-xs text-amber-200 font-semibold tracking-wider mb-1" : "uppercase text-xs text-orange-500 font-semibold tracking-wider mb-1"}>{title}</div>
        <div className={accent ? "text-3xl font-bold text-white" : "text-2xl font-bold text-amber-700"}>{value}</div>
      </div>
      <div className={accent ? "flex items-center justify-center h-12 w-12 rounded-full bg-white/20" : "flex items-center justify-center h-12 w-12 rounded-full bg-orange-50"}>
        {icon}
      </div>
    </div>
    {(leftLabel || rightLabel) && (
      <div className={accent ? "flex justify-between items-center border-t border-amber-200 mt-4 pt-3 text-xs text-amber-100" : "flex justify-between items-center border-t mt-4 pt-3 text-xs text-orange-500"}>
        <div>
          {leftLabel && <span className="block uppercase text-[10px] font-bold">{leftLabel}</span>}
          {leftValue && <span className="font-bold text-base">{leftValue}</span>}
        </div>
        <div className="text-right">
          {rightLabel && <span className="block uppercase text-[10px] font-bold">{rightLabel}</span>}
          {rightValue && <span className="font-bold text-base">{rightValue}</span>}
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