import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UserProfileMenu from "@/app/admin/login/UserProfileMenu";
import Image from "next/image";
import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";

interface AdminHeaderProps {
  onBurgerClick?: () => void;
}

const AdminHeader = ({ onBurgerClick }: AdminHeaderProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  // Gestion de la soumission de recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici tu peux ajouter la logique de recherche admin
  };

  return (
    <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={onBurgerClick}
          aria-label="Ouvrir le menu"
        >
          <FiMenu size={26} />
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-sm rounded-full p-2 flex items-center justify-center">
            <FaUserShield size={22} className="text-white" />
          </span>
          <span className="text-lg font-bold text-white tracking-wide">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
            <FiBell size={22} />
          </button>
          <div className="relative" ref={avatarRef}>
            <button
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              onClick={() => router.push("/admin/users/profile/edit")}
              aria-label="Profil"
            >
              {session?.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-gray-200 flex items-center justify-center text-lg text-gray-500 rounded-full">
                  {session?.user?.firstName?.[0] || "A"}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Header desktop */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-8 py-4">
        {/* Logo et titre */}
        <div className="flex items-center gap-4 min-w-[220px]">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 flex items-center justify-center">
            <FaUserShield size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Administration</h1>
            <p className="text-amber-200 text-xs mt-1">Gestion de la boutique</p>
          </div>
        </div>
        {/* Barre de recherche centrée */}
        <div className="flex-1 flex justify-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-12 pr-4 py-2 bg-white/95 backdrop-blur-sm border-0 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none shadow-lg text-sm"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              name="q"
              autoComplete="off"
            />
          </form>
        </div>
        {/* Actions utilisateur */}
        <div className="flex items-center gap-4 min-w-[160px] justify-end">
          <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group">
            <FiBell size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="relative" ref={avatarRef}>
            <button
              className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
              onClick={() => router.push("/admin/users/profile/edit")}
              aria-label="Profil"
            >
              {session?.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-2xl text-gray-500 rounded-full">
                  {session?.user?.firstName?.[0] || "A"}
                </div>
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Profil
              </span>
            </button>
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 