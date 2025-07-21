import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import DashboardHeader from "@/app/admin/dashboard/DashboardHeader";
import StatCardsGrid from "@/app/admin/dashboard/StatCardsGrid";
import RecentOrders from "@/app/admin/dashboard/RecentOrders";
import LowStockProducts from "@/app/admin/dashboard/LowStockProducts";
import TopSellingProducts from "@/app/admin/dashboard/TopSellingProducts";

// Interface TypeScript pour les statistiques du dashboard
// Définit la structure des données retournées par getDashboardStats()
interface RecentOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}
interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}
interface TopSellingProduct {
  id: string;
  name: string;
  sold: number;
}
interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
  todayClients: number;
  monthlyClients: number;
  todayOrders: number;
  monthlyOrders: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

// Fonction asynchrone pour récupérer toutes les statistiques du dashboard
// Cette fonction exécute plusieurs requêtes Prisma en parallèle pour optimiser les performances
async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Calcul des dates pour les statistiques temporelles
    const now = new Date();
    const todayStart = startOfDay(now);    // Début de la journée (00:00:00)
    const todayEnd = endOfDay(now);        // Fin de la journée (23:59:59)
    const monthStart = startOfMonth(now);  // Début du mois
    const monthEnd = endOfMonth(now);      // Fin du mois

    // Exécution de toutes les requêtes en parallèle avec Promise.all()
    // Cela améliore significativement les performances par rapport à des requêtes séquentielles
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
      todayClients,
      monthlyClients,
      todayOrders,
      monthlyOrders,
      todayEarnings,
      monthlyEarnings
    ] = await Promise.all([
      // 1. Nombre total de produits en base de données
      prisma.product.count(),
      
      // 2. Nombre total de commandes
      prisma.order.count(),
      
      // 3. Nombre total d'utilisateurs
      prisma.user.count(),
      
      // 4. Chiffre d'affaires total (uniquement les commandes payées)
      prisma.order.aggregate({
        where: {
          status: {
            in: ["PROCESSING", "SHIPPED", "DELIVERED"] // Commandes avec paiement vérifié
          }
        },
        _sum: {
          total: true // Somme du champ total
        }
      }),
      
      // 5. Commandes récentes (5 dernières commandes avec infos utilisateur)
      prisma.order.findMany({
        take: 5, // Limite à 5 résultats
        orderBy: {
          createdAt: "desc" // Tri par date de création décroissante
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      
      // 6. Produits en stock faible (moins de 10 unités et actifs)
      prisma.product.findMany({
        where: {
          stock: {
            lt: 10 // Stock inférieur à 10
          },
          isActive: true // Produits actifs uniquement
        },
        take: 5, // Limite à 5 résultats
        orderBy: {
          stock: "asc" // Tri par stock croissant (plus faible en premier)
        }
      }),
      
      // 7. Produits les plus vendus (top 5 par quantité vendue)
      prisma.orderItem.groupBy({
        by: ["productId"], // Groupement par produit
        _sum: { quantity: true },           // Somme des quantités vendues
        orderBy: {
          _sum: {
            quantity: "desc" // Tri par quantité décroissante
          }
        },
        take: 5, // Top 5
      }),
      
      // 8. Nouveaux clients aujourd'hui
      prisma.user.count({
        where: { 
          createdAt: { 
            gte: todayStart, // Date de création >= début de journée
            lte: todayEnd    // Date de création <= fin de journée
          } 
        }
      }),
      
      // 9. Nouveaux clients ce mois
      prisma.user.count({
        where: { 
          createdAt: { 
            gte: monthStart, // Date de création >= début du mois
            lte: monthEnd    // Date de création <= fin du mois
          } 
        }
      }),
      
      // 10. Commandes aujourd'hui
      prisma.order.count({
        where: { 
          createdAt: { 
            gte: todayStart, 
            lte: todayEnd 
          } 
        }
      }),
      
      // 11. Commandes ce mois
      prisma.order.count({
        where: { 
          createdAt: { 
            gte: monthStart, 
            lte: monthEnd 
          } 
        }
      }),
      
      // 12. Gains aujourd'hui (commandes payées uniquement)
      prisma.order.aggregate({
        where: { 
          createdAt: { 
            gte: todayStart, 
            lte: todayEnd 
          }, 
          status: {
            in: ["PROCESSING", "SHIPPED", "DELIVERED"] // Commandes avec paiement vérifié
          }
        },
        _sum: { total: true }
      }),
      
      // 13. Gains ce mois (commandes payées uniquement)
      prisma.order.aggregate({
        where: { 
          createdAt: { 
            gte: monthStart, 
            lte: monthEnd 
          }, 
          status: {
            in: ["PROCESSING", "SHIPPED", "DELIVERED"] // Commandes avec paiement vérifié
          }
        },
        _sum: { total: true }
      })
    ]);

    // Récupérer les informations complètes des produits les plus vendus
    const topSellingProductsWithDetails = await Promise.all(
      (topSellingProducts || []).map(async (item) => {
        if (!item.productId) return null;
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            sku: true
          }
        });
        if (!product) return null;
        return {
          ...item,
          ...product,
          price: product?.price?.toNumber?.() || 0
        };
      })
    );

    // Convertir les commandes récentes pour éviter les erreurs Decimal
    const serializedRecentOrders = (recentOrders || []).map(order => ({
      ...order,
      total: order?.total?.toNumber?.() || 0
    }));

    // Retour des statistiques formatées
    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum?.total?.toNumber() || 0, // Conversion Decimal vers number
      recentOrders: serializedRecentOrders,
      lowStockProducts,
      topSellingProducts: topSellingProductsWithDetails,
      todayClients,
      monthlyClients,
      todayOrders,
      monthlyOrders,
      todayEarnings: todayEarnings._sum?.total?.toNumber() || 0,
      monthlyEarnings: monthlyEarnings._sum?.total?.toNumber() || 0
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Impossible de récupérer les statistiques");
  }
}

// Page principale du dashboard administrateur
// Cette page affiche un aperçu complet de l'activité de l'e-commerce
export default async function AdminDashboardPage() {
  // Récupération des statistiques (fonction asynchrone)
  const stats = await getDashboardStats();

  return (
    <div className="bg-[#f8fafc] min-h-screen space-y-6"> {/* Conteneur principal harmonisé avec le client */}
      {/* En-tête du dashboard avec titre et actions */}
      <DashboardHeader />
      
      {/* Grille des cartes de statistiques principales */}
      <StatCardsGrid stats={stats} />
      
      {/* Section des produits les plus vendus */}
      <TopSellingProducts topSellingProducts={stats.topSellingProducts} />
      
      {/* Grille de 2 colonnes pour les sections secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <RecentOrders recentOrders={stats.recentOrders} />
        
        {/* Produits en stock faible */}
        <LowStockProducts lowStockProducts={stats.lowStockProducts} />
      </div>
    </div>
  );
} 