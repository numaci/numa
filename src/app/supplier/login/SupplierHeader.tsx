import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";

interface SupplierHeaderProps {
  onBurgerClick?: () => void;
  supplier?: any;
}

const SupplierHeader = ({ onBurgerClick, supplier }: SupplierHeaderProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Fonction de déconnexion
  const handleSignOut = async () => {
    if (session?.user) {
      await signOut({ redirect: false });
      router.push("/login");
    } else {
      localStorage.removeItem("supplierId");
      router.push("/login");
    }
  };

  const displayName = session?.user?.role === "ADMIN"
    ? session.user.firstName + " " + session.user.lastName
    : supplier?.name;
  const displayEmail = session?.user?.role === "ADMIN"
    ? session.user.email
    : supplier?.email;

  return (
    <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl">
      {/* Header mobile simplifié */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={onBurgerClick}
          aria-label="Ouvrir le menu"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-sm rounded-full p-2 flex items-center justify-center">
            <FaUserTie size={22} className="text-white" />
          </span>
          <span className="text-lg font-bold text-white tracking-wide">Espace Fournisseur</span>
        </div>
      </div>
      {/* Header desktop */}
      <div className="hidden md:flex items-center max-w-7xl mx-auto px-6 py-4">
        {/* Logo et titre */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <FaUserTie size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Espace Fournisseur</h1>
            <p className="text-amber-200 text-sm">Gestion de vos produits et commandes</p>
          </div>
        </div>
        {/* Actions utilisateur */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Profil */}
          <div className="relative" ref={avatarRef}>
            <button
              className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Profil"
            >
              <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-full">
                <FaUserTie className="text-amber-600 text-xl" />
              </div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Profil
              </span>
            </button>
            {/* Menu profil utilisateur */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/90 text-gray-900 rounded-2xl shadow-2xl z-30 p-6 border border-amber-100">
                <div className="mb-4 pb-4 border-b border-amber-100">
                  <div className="font-bold text-lg text-amber-700">{displayName}</div>
                  <div className="text-sm text-amber-500">{displayEmail}</div>
                  <div className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full inline-block mt-1 shadow">
                    {session?.user?.role === "ADMIN" ? "Administrateur" : "Fournisseur"}
                  </div>
                </div>
                <Link href="/supplier/profile" className="block w-full rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-base shadow-sm transition-all duration-200 px-4 py-2 text-center mb-3">
                  Modifier mon mot de passe
                </Link>
                <button
                  className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-md transition-all duration-200 px-4 py-2"
                  onClick={handleSignOut}
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SupplierHeader; 