"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { FaUser, FaSignOutAlt, FaCog, FaShoppingBag, FaHeart } from "react-icons/fa";

export default function ProfileDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session, status } = useSession();
  const ref = useRef<HTMLDivElement>(null);

  // Ajout pour gestion fournisseur
  const [supplier, setSupplier] = useState<any>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  useEffect(() => {
    if (open && !session?.user) {
      const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
      if (supplierId) {
        setSupplierLoading(true);
        fetch(`/api/admin/suppliers/${supplierId}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Fournisseur introuvable");
            return res.json();
          })
          .then((data) => {
            setSupplier(data);
            setSupplierLoading(false);
          })
          .catch(() => {
            setSupplier(null);
            setSupplierLoading(false);
          });
      } else {
        setSupplier(null);
      }
    }
    if (!open) {
      setSupplier(null);
      setSupplierLoading(false);
    }
  }, [open, session?.user]);

  const handleSignOut = async () => {
    if (session?.user) {
      await signOut({ redirect: false });
    } else {
      localStorage.removeItem("supplierId");
    }
    onClose();
  };

  if (!open) return null;

  // Affichage loading fournisseur
  if (supplierLoading) {
    return (
      <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white/90 text-gray-900 rounded-2xl shadow-2xl z-30 p-6 border border-amber-100">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage fournisseur si connecté comme fournisseur
  if (supplier) {
    return (
      <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white/90 text-gray-900 rounded-2xl shadow-2xl z-30 p-6 border border-amber-100">
        <div className="mb-4 pb-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shadow">
              <FaUser className="text-amber-600 text-2xl" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-amber-700">{supplier.name}</div>
              <div className="text-sm text-amber-500">{supplier.email}</div>
              <div className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full inline-block mt-1 shadow">Fournisseur</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold" onClick={onClose}>
            <FaUser className="text-amber-500" />
            <span>Mon Profil</span>
          </Link>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-full border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-semibold text-base transition-all duration-200" onClick={() => { window.location.href = "/supplier/dashboard"; onClose(); }}>
            <FaCog />
            Espace fournisseur
          </Button>
        </div>
        <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-full border-amber-400 text-amber-600 hover:bg-red-50 hover:text-red-600 font-semibold text-base transition-all duration-200" onClick={handleSignOut}>
          <FaSignOutAlt />
          Se déconnecter
        </Button>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white/90 text-gray-900 rounded-2xl shadow-2xl z-30 p-6 border border-amber-100">
      {status === "loading" ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
        </div>
      ) : session?.user ? (
        <>
          {/* En-tête avec informations utilisateur */}
          <div className="mb-4 pb-4 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shadow">
                <FaUser className="text-amber-600 text-2xl" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-amber-700">
                  {session.user.firstName} {session.user.lastName}
                </div>
                <div className="text-sm text-amber-500">{session.user.email}</div>
                {session.user.role === "ADMIN" && (
                  <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full inline-block mt-1 shadow">
                    Administrateur
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Menu de navigation */}
          <div className="space-y-2 mb-4">
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold"
              onClick={onClose}
            >
              <FaUser className="text-amber-500" />
              <span>Mon Profil</span>
            </Link>
            <Link 
              href="/orders" 
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold"
              onClick={onClose}
            >
              <FaShoppingBag className="text-amber-500" />
              <span>Mes Commandes</span>
            </Link>
            <Link 
              href="/wishlist" 
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold"
              onClick={onClose}
            >
              <FaHeart className="text-amber-500" />
              <span>Mes Favoris</span>
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold"
              onClick={onClose}
            >
              <FaCog className="text-amber-500" />
              <span>Paramètres</span>
            </Link>
          </div>
          {/* Bouton de déconnexion */}
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 rounded-full border-amber-400 text-amber-600 hover:bg-red-50 hover:text-red-600 font-semibold text-base transition-all duration-200" 
            onClick={handleSignOut}
          >
            <FaSignOutAlt />
            Se déconnecter
          </Button>
        </>
      ) : (
        <>
          {/* État non connecté */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              <FaUser className="text-amber-500 text-2xl" />
            </div>
            <h3 className="font-bold text-lg text-amber-700">Bienvenue !</h3>
            <p className="text-sm text-gray-500">Connectez-vous pour accéder à votre profil</p>
          </div>
          <div className="space-y-3">
            <Link href="/login" onClick={onClose}>
              <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200">Se connecter</Button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button variant="outline" className="w-full rounded-full border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold text-base transition-all duration-200">Créer un compte</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
} 