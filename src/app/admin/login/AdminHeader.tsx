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
    <header className="admin-header">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between px-6 py-4">
        <button
          className="admin-button-secondary p-3 rounded-xl hover:scale-105"
          onClick={onBurgerClick}
          aria-label="Ouvrir le menu"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex items-center gap-3">
          <span className="bg-black rounded-xl p-2 flex items-center justify-center">
            <FaUserShield size={20} className="text-white" />
          </span>
          <span className="text-lg font-semibold text-black tracking-tight antialiased">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="admin-button-secondary p-3 rounded-xl hover:scale-105">
            <FiBell size={20} />
          </button>
          <div className="relative" ref={avatarRef}>
            <button
              className="admin-button-secondary p-2 rounded-xl hover:scale-105"
              onClick={() => router.push("/admin/users/profile/edit")}
              aria-label="Profil"
            >
              {session?.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-black text-white flex items-center justify-center text-sm font-semibold rounded-full">
                  {session?.user?.name?.[0] || "A"}
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
          <div className="bg-black rounded-xl p-3 flex items-center justify-center">
            <FaUserShield size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight antialiased text-black">Administration</h1>
            <p className="text-gray-600 text-sm mt-1 antialiased">Gestion de la boutique</p>
          </div>
        </div>
        {/* Barre de recherche centrée */}
       
        {/* Actions utilisateur */}
        <div className="flex items-center gap-4 min-w-[160px] justify-end">
          <button className="relative admin-button-secondary p-3 rounded-xl hover:scale-105">
            <FiBell size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow"></span>
          </button>
          <div className="relative" ref={avatarRef}>
            <button
              className="relative admin-button-secondary p-3 rounded-xl hover:scale-105"
              onClick={() => router.push("/admin/users/profile/edit")}
              aria-label="Profil"
            >
              {session?.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-lg font-semibold rounded-full">
                  {session?.user?.name?.[0] || "A"}
                </div>
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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