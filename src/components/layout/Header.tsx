"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { FaShoppingCart, FaUser, FaThLarge, FaSearch, FaClipboardList, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "@/hooks/useCart";
import CartDropdown from "./CartDropdown";
import ProfileDropdown from "./ProfileDropdown";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

// Composant Header pour la partie client
// Inclut la navigation, la recherche et les actions utilisateur
export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isCartOpen, openCart, closeCart } = useCartDrawer();
  const [hasJustSelectedSuggestion, setHasJustSelectedSuggestion] = useState(false);
  const ignoreNextBlur = useRef(false);

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

  // Suggestions de recherche (produits) - ACTIVE SUR MOBILE ET DESKTOP
  useEffect(() => {
    if (hasJustSelectedSuggestion) return;
    if (searchQuery.length < 2 || !isSearchFocused) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Délai pour éviter trop de requêtes
    const timeoutId = setTimeout(() => {
      let active = true;
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&page=1&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (active) {
            setSuggestions(data.products || []);
            setShowSuggestions(true);
          }
        })
        .catch(() => {
          if (active) {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        });
      return () => { active = false; };
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSearchFocused, hasJustSelectedSuggestion]);

  // Gestion des touches clavier pour les suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Gestion de la soumission de recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      // Utiliser router.push pour la navigation côté Next.js
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Header mobile façon Jumia (sans icône panier, style orange)
  const MobileJumiaHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 shadow">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Menu burger */}
        <button className="p-2" aria-label="Menu" onClick={() => setIsMobileMenuOpen(true)}>
          <FaBars size={22} className="text-white" />
        </button>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-bold text-xl text-white drop-shadow">SIKASSO</span>
          <span className="font-bold text-xl text-yellow-300 drop-shadow">SUGU</span>
        </Link>
        {/* Icône panier mobile avec badge */}
        <button onClick={openCart} className="relative" aria-label="Panier">
          <FaShoppingCart size={22} className="text-white" />
          {isClient && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      {/* Menu latéral mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Drawer */}
          <div ref={mobileMenuRef} className="relative w-64 max-w-full h-full bg-white text-gray-900 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-bold text-amber-600">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-amber-100 hover:text-amber-600 text-2xl transition-colors">×</button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/" className="block py-2 px-4 rounded hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
              <Link href="/categories" className="block py-2 px-4 rounded hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Catégories</Link>
              <Link href="/orders" className="block py-2 px-4 rounded hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Commandes</Link>
              <Link href="/cart" className="block py-2 px-4 rounded hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Panier</Link>
              <Link href="/profile" className="block py-2 px-4 rounded hover:bg-amber-50 text-amber-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Compte</Link>
            </nav>
          </div>
        </div>
      )}
      {/* Barre de recherche */}
      <div className="px-3 pb-2 relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" size={16} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-white border-0 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:outline-none shadow"
            placeholder="Cherchez un produit, catégorie..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            name="q"
            autoComplete="off"
            ref={inputRef}
            onFocus={() => {
              setIsSearchFocused(true);
              setShowSuggestions(suggestions.length > 0);
            }}
            onBlur={() => {
              if (ignoreNextBlur.current) {
                ignoreNextBlur.current = false;
                return;
              }
              setTimeout(() => {
                setIsSearchFocused(false);
                setShowSuggestions(false);
              }, 200);
            }}
          />
        </form>
        {/* Suggestions mobile */}
        {showSuggestions && suggestions.length > 0 && isSearchFocused && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((s: any) => (
              <div
                key={s.id}
                className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-900 active:bg-amber-100"
                // Remplir l'input et garder le focus, sans navigation immédiate
                onClick={() => {
                  ignoreNextBlur.current = true;
                  setShowSuggestions(false);
                  setHasJustSelectedSuggestion(true);
                  setSearchQuery(s.name);
                  if (inputRef.current) inputRef.current.blur();
                  router.push(`/products/${s.slug}`);
                  setTimeout(() => setHasJustSelectedSuggestion(false), 1000);
                }}
              >
                {s.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <MobileJumiaHeader />
      {/* Header desktop moderne */}
      <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl hidden md:block mb-0 pb-0">
        {/* Barre supérieure avec informations de contact */}
        <div className="bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  contact@sikassosugu.ml
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +223 XX XX XX XX
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {status === "unauthenticated" ? (
                  <>
                    <Link href="/login" className="hover:text-amber-200 transition-colors">
                      Se connecter
                    </Link>
                    <Link href="/register" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                      S'inscrire
                    </Link>
                  </>
                ) : (
                  <span className="text-amber-200">
                    Bienvenue, {session?.user?.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre principale (fixe) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <FaShoppingCart size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Sikasso Sugu</h1>
                  <p className="text-amber-200 text-sm">Votre boutique en ligne malienne</p>
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="flex-1 mx-8 max-w-2xl relative">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-0 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      name="q"
                      autoComplete="off"
                      onFocus={() => {
                        setIsSearchFocused(true);
                        setShowSuggestions(suggestions.length > 0);
                      }}
                      onBlur={() => {
                        if (ignoreNextBlur.current) {
                          ignoreNextBlur.current = false;
                          return;
                        }
                        setTimeout(() => {
                          setIsSearchFocused(false);
                          setShowSuggestions(false);
                        }, 200);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full transition-colors"
                    >
                      Rechercher
                    </button>
                  </div>
                </form>
                {/* Suggestions desktop */}
                {showSuggestions && suggestions.length > 0 && isSearchFocused && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((s: any) => (
                      <div
                        key={s.id}
                        className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-900"
                        onClick={() => {
                          ignoreNextBlur.current = true;
                          setShowSuggestions(false);
                          setHasJustSelectedSuggestion(true);
                          setSearchQuery(s.name);
                          if (inputRef.current) inputRef.current.blur();
                          router.push(`/products/${s.slug}`);
                          setTimeout(() => setHasJustSelectedSuggestion(false), 1000);
                        }}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions utilisateur */}
              <div className="flex items-center gap-4">
                {/* Commandes */}
                {status === "authenticated" && (
                  <Link
                    href="/orders"
                    className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                    aria-label="Mes commandes"
                  >
                    <FaClipboardList size={20} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Mes commandes
                    </span>
                  </Link>
                )}
                
                {/* Profil */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                    aria-label="Profil"
                  >
                    <FaUser size={20} />
                    {status === "authenticated" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Profil
                    </span>
                  </button>
                  <ProfileDropdown open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                </div>
                
                {/* Panier */}
                <div className="relative">
                  <button
                    onClick={openCart}
                    className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                    aria-label="Panier"
                    disabled={cartLoading}
                  >
                    <FaShoppingCart size={20} className={cartLoading ? 'opacity-50' : ''} />
                    {isClient && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                        {cartCount}
                      </span>
                    )}
                    {cartLoading && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Panier
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <div className="bg-black/10 backdrop-blur-sm border-t border-white/20 mt-[85px]">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Menu catégories */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <FaThLarge size={18} />
                  Catégories
                  <svg className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown catégories */}
                {isCategoryOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white text-gray-900 rounded-xl shadow-2xl z-50 border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-amber-600">
                        <FaThLarge />
                        Toutes les catégories
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <FaThLarge size={32} className="mx-auto mb-2 text-gray-300" />
                          Aucune catégorie disponible
                        </div>
                      ) : (
                        <div className="p-2">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products/category/${cat.slug}`}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors group"
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              {cat.imageUrl ? (
                                <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="w-10 h-10 object-cover rounded-lg" />
                              ) : (
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <FaThLarge className="text-amber-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <span className="font-medium">{cat.name}</span>
                                <div className="text-sm text-gray-500">
                                  {cat.productCount ?? cat._count?.products ?? 0} produits
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
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
              <nav className="flex items-center gap-8">
                <Link 
                  href="/" 
                  className="font-semibold hover:text-amber-200 transition-colors relative group"
                >
                  Accueil
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-200 transition-all group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/products" 
                  className="font-semibold hover:text-amber-200 transition-colors relative group"
                >
                  Boutique
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-200 transition-all group-hover:w-full"></span>
                </Link>
                {status === "authenticated" && (
                  <Link 
                    href="/profile" 
                    className="font-semibold hover:text-amber-200 transition-colors relative group"
                  >
                    Mon Compte
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-200 transition-all group-hover:w-full"></span>
                  </Link>
                )}
                {status === "authenticated" && session?.user?.role === "ADMIN" && (
                  <Link 
                    href="/admin/dashboard" 
                    className="font-semibold text-amber-200 hover:text-white transition-colors relative group"
                  >
                    Administration
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
                  </Link>
                )}
                {/* Lien espace fournisseur si connecté comme fournisseur */}
                {isSupplierChecked && supplier && (
                  <Link
                    href="/supplier/dashboard"
                    className="font-semibold text-blue-200 hover:text-blue-400 transition-colors relative group"
                  >
                    Espace fournisseur
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-200 transition-all group-hover:w-full"></span>
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