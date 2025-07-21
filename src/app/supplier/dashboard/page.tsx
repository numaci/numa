"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FaBoxOpen, FaPlus, FaUserTie, FaClipboardList, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";

export default function SupplierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 });

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      setLoading(false);
      return;
    }
    if (session?.user) {
      // Si utilisateur mais pas admin, accès refusé
      router.push("/");
      return;
    }
    // Vérifier si supplierId existe
    const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
    if (supplierId) {
      fetch(`/api/admin/suppliers/${supplierId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Fournisseur introuvable");
          return res.json();
        })
        .then((data) => {
          setSupplier(data);
          setLoading(false);
        })
        .catch(() => {
          setSupplier(null);
          setLoading(false);
          router.push("/login");
        });
    } else {
      setLoading(false);
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Charger les statistiques fournisseur si connecté
    if (session?.user?.role === "ADMIN" || supplier) {
      const supplierId = session?.user?.role === "ADMIN" ? undefined : supplier?.id;
      fetch(`/api/supplier/stats${supplierId ? `?supplierId=${supplierId}` : ""}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Erreur stats");
          return res.json();
        })
        .then((data) => setStats(data))
        .catch(() => setStats({ products: 0, orders: 0, sales: 0 }));
    }
  }, [session, supplier]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Protection : seuls fournisseurs ou admins
  if (!session?.user && !supplier) return null;

  // Infos à afficher (nom, email, etc)
  const displayName = session?.user?.role === "ADMIN"
    ? session.user.firstName + " " + session.user.lastName
    : supplier?.name;
  const displayEmail = session?.user?.role === "ADMIN"
    ? session.user.email
    : supplier?.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Statistiques */}
          <div className="p-8 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-amber-50 rounded-xl shadow flex flex-col items-center justify-center p-6">
                <FaBoxOpen className="text-amber-500 text-3xl mb-2" />
                <div className="text-2xl font-bold text-amber-700">{stats.products}</div>
                <div className="text-gray-600">Produits publiés</div>
              </div>
              <div className="bg-amber-50 rounded-xl shadow flex flex-col items-center justify-center p-6">
                <FaClipboardList className="text-amber-500 text-3xl mb-2" />
                <div className="text-2xl font-bold text-amber-700">{stats.orders}</div>
                <div className="text-gray-600">Commandes reçues</div>
              </div>
              <div className="bg-amber-50 rounded-xl shadow flex flex-col items-center justify-center p-6">
                <FaMoneyBillWave className="text-amber-500 text-3xl mb-2" />
                <div className="text-2xl font-bold text-amber-700">{stats.sales} XOF</div>
                <div className="text-gray-600">Ventes réalisées</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 