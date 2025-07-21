"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SupplierSidebar from "@/app/supplier/login/SupplierSidebar";
import SupplierHeader from "@/app/supplier/login/SupplierHeader";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supplier, setSupplier] = useState<any>(null);
  const router = useRouter();

  // Pages qui ne nécessitent pas d'authentification
  const isLoginPage = pathname === "/supplier/login";

  useEffect(() => {
    if (status === "loading") return;
    if (isLoginPage) return;
    if (session?.user?.role === "ADMIN") return;
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
        .then((data) => setSupplier(data))
        .catch(() => {
          setSupplier(null);
          router.push("/login");
        });
    } else {
      setSupplier(null);
      router.push("/login");
    }
  }, [session, status, pathname, router, isLoginPage]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Protection : seuls fournisseurs ou admins
  if (!session?.user && !supplier) return null;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sidebar desktop */}
      <SupplierSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} supplier={supplier} />
      {/* Wrapper principal du contenu, avec padding-left pour ne pas passer sous la sidebar */}
      <div className="md:pl-64 pl-0 transition-all">
        <div className="flex flex-col overflow-visible">
          <SupplierHeader onBurgerClick={() => setSidebarOpen(true)} supplier={supplier} />
          <main className="flex-1 overflow-visible p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 