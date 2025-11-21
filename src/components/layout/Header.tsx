"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { FaShoppingBag, FaUser, FaThLarge } from "react-icons/fa";
import { useCart } from "@/hooks/useCart";
import CartDropdown from "./CartDropdown";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

// Composant Header pour la partie client
// Inclut la navigation et les actions utilisateur (recherche supprimée)
export default function Header() {
  // Statut d'authentification NextAuth
  const { status, data: session } = useSession();
  const router = useRouter();
  
  
  
  
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const { isCartOpen, openCart, closeCart } = useCartDrawer();
  
  

  // Fermer le menu mobile si clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobileMenuOpen]);

  // Hook pour le panier connecté
  const { 
    items, 
    isLoading: cartLoading, 
    loadCartFromDatabase,
    isAuthenticated 
  } = useCart();
  
  // Calculer le cartCount directement à partir des items
  const cartCount = useMemo(() => {
    if (!isClient) return 0;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return count;
  }, [isClient, items]);

  // Récupérer les catégories dynamiquement
  useEffect(() => {
    if (!isCategoryOpen) return;
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, [isCategoryOpen]);

  // Marquer le composant comme côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ajout pour gestion fournisseur
  const [supplier, setSupplier] = useState<any>(null);
  const [isSupplierChecked, setIsSupplierChecked] = useState(false);
  useEffect(() => {
    // Si pas d'utilisateur NextAuth, vérifier si supplierId existe
    if (!session?.user) {
      const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
      if (supplierId) {
        fetch(`/api/admin/suppliers/${supplierId}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Fournisseur introuvable");
            return res.json();
          })
          .then((data) => setSupplier(data))
          .catch(() => setSupplier(null))
          .finally(() => setIsSupplierChecked(true));
      } else {
        setSupplier(null);
        setIsSupplierChecked(true);
      }
    } else {
      setSupplier(null);
      setIsSupplierChecked(true);
    }
  }, [session?.user]);

  
  // Icône menu style "=" (deux traits)
  const MenuEqualIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="7" width="18" height="2" fill="currentColor" />
      <rect x="3" y="15" width="18" height="2" fill="currentColor" />
    </svg>
  );

  // Header mobile minimaliste et luxueux
  const MobileJumiaHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo à gauche */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-semibold text-xl text-black tracking-tight">NUMA</span>
        </Link>
        {/* Actions à droite: compte, panier, menu (==) */}
        <div className="flex items-center gap-2">
          <Link
            href={status === "authenticated" ? "/profile" : "/login"}
            className="relative p-2 transition-all duration-300 hover:bg-gray-100 rounded-full"
            aria-label="Compte"
          >
            <FaUser size={18} className="text-black" />
          </Link>
          <button onClick={openCart} className="relative p-2 transition-all duration-300 hover:bg-gray-100 rounded-full" aria-label="Panier">
            <FaShoppingBag size={18} className="text-black" />
            {isClient && cartCount > 0 && (
              <span className="absolute -top-2 -right-1 bg-black text-white text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </button>
          {/* Menu égal "=" à la fin */}
          <button className="p-2 transition-all duration-300 hover:bg-gray-100 rounded-full" aria-label="Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuEqualIcon size={18} className="text-black" />
          </button>
        </div>
      </div>
      {/* Menu latéral mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Drawer */}
          <div ref={mobileMenuRef} className="absolute right-0 top-0 w-72 max-w-full h-full bg-white text-black shadow-lg flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <span className="text-xl font-semibold tracking-tight">NUMA</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-black text-2xl transition-all duration-300">×</button>
            </div>
            <nav className="flex-1 p-6 space-y-4">
              <Link href="/" className="block py-3 px-4 hover:bg-gray-100 text-black font-medium tracking-tight transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
              <Link href="/categories" className="block py-3 px-4 hover:bg-gray-100 text-black font-medium tracking-tight transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
              
              <Link href={status === "authenticated" ? "/profile" : "/login"} className="block py-3 px-4 hover:bg-gray-100 text-black font-medium tracking-tight transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Mon compte</Link>
              <Link href="/cart" className="block py-3 px-4 hover:bg-gray-100 text-black font-medium tracking-tight transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Panier</Link>
              
            </nav>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileJumiaHeader />
      {/* Header desktop minimaliste et luxueux */}
      <header className="bg-black text-white shadow-md hidden md:block mb-0 pb-0">
        {/* Barre supérieure avec informations de contact */}
        <div className="border-b border-gray-dark/20">
          <div className="max-w-7xl mx-auto px-8 py-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <span className="flex items-center gap-2 text-gray-light hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  contact@numa.com
                </span>
                <span className="flex items-center gap-2 text-gray-light hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +223 XX XX XX XX
                </span>
              </div>
              <div className="flex items-center space-x-6">
                {status === "unauthenticated" ? (
                  <>
                    
                    <Link href="/register" className="border border-white/30 hover:bg-white hover:text-black px-4 py-1.5 transition-all duration-300">
                      Rejoindre NUMA
                    </Link>
                  </>
                ) : (
                  <span className="text-white">
                    Bienvenue, {session?.user?.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre principale (fixe) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
          <div className="max-w-7xl mx-auto px-8 py-5">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">NUMA</h1>
                </div>
              </div>

              {/* Actions utilisateur */}
              <div className="flex items-center gap-6">
                {/* Compte */}
                <div className="relative">
                  <Link
                    href={status === "authenticated" ? "/profile" : "/login"}
                    className="relative p-3 hover:bg-white/5 transition-all duration-300 group"
                    aria-label="Compte"
                  >
                    <FaUser size={18} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                      Mon compte
                    </span>
                  </Link>
                </div>
                {/* Panier */}
                <div className="relative">
                  <button
                    onClick={openCart}
                    className="relative p-3 hover:bg-white/5 transition-all duration-300 group"
                    aria-label="Panier"
                    disabled={cartLoading}
                  >
                    <FaShoppingBag size={18} className={cartLoading ? 'opacity-50' : ''} />
                    {isClient && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {cartCount}
                      </span>
                    )}
                    {cartLoading && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                      Panier
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <div className="border-t border-gray-dark/10 mt-[85px]">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Menu catégories */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-3 border border-white/10 hover:bg-white/5 px-6 py-3 font-medium tracking-tight transition-all duration-300"
                >
                  <FaThLarge size={16} />
                  Catégories
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown catégories */}
                {isCategoryOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white text-black shadow-md z-50 border border-gray-light/30 animate-fade-in">
                    <div className="p-5 border-b border-gray-light/30">
                      <h3 className="font-semibold text-lg flex items-center gap-2 tracking-tight">
                        <FaThLarge size={16} />
                        Toutes les catégories
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {categories.length === 0 ? (
                        <div className="p-6 text-center text-gray-dark">
                          <FaThLarge size={24} className="mx-auto mb-3 text-gray-light" />
                          Aucune catégorie disponible
                        </div>
                      ) : (
                        <div className="p-3">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products/category/${cat.slug}`}
                              prefetch={true}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-light/20 transition-all duration-300 group"
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              {cat.imageUrl ? (
                                <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="w-10 h-10 object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-light/30 flex items-center justify-center">
                                  <FaThLarge className="text-gray-dark" />
                                </div>
                              )}
                              <div className="flex-1">
                                <span className="font-medium tracking-tight">{cat.name}</span>
                                <div className="text-sm text-gray-dark">
                                  {cat.productCount ?? cat._count?.products ?? 0} produits
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-gray-dark group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation principale */}
              <nav className="flex items-center gap-10">
                <Link 
                  href="/" 
                  className="font-medium tracking-tight hover:text-gray-light transition-all duration-300 relative group"
                >
                  Accueil
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/products" 
                  prefetch={true}
                  className="font-medium tracking-tight hover:text-gray-light transition-all duration-300 relative group"
                >
                  Boutique
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                {status === "authenticated" && (
                  <Link 
                    href="/profile" 
                    className="font-medium tracking-tight hover:text-gray-light transition-all duration-300 relative group"
                  >
                    Mon Compte
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
                {status === "authenticated" && session?.user?.role === "ADMIN" && (
                  <Link 
                    href="/admin/dashboard" 
                    className="font-medium tracking-tight text-white hover:text-gray-light transition-all duration-300 relative group"
                  >
                    Administration
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
                {/* Lien espace fournisseur si connecté comme fournisseur */}
                {isSupplierChecked && supplier && (
                  <Link
                    href="/supplier/dashboard"
                    className="font-medium tracking-tight text-white hover:text-gray-light transition-all duration-300 relative group"
                  >
                    Espace fournisseur
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}