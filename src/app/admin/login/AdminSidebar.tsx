import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FiShoppingBag, FiBarChart2, FiBox, FiTag, FiVolume2, FiClipboard, FiUsers, FiChevronLeft, FiChevronRight, FiX, FiTruck, FiMessageCircle } from "react-icons/fi";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ open = false, onClose }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Liens de navigation admin avec icônes react-icons
  const navItems = [
    { href: "/", label: "Boutique", icon: FiShoppingBag },
    { href: "/admin/dashboard", label: "Tableau de bord", icon: FiBarChart2 },
    { href: "/admin/products", label: "Produits", icon: FiBox },
    { href: "/admin/categories", label: "Catégories", icon: FiTag },
    { href: "/admin/ads", label: "Publicités", icon: FiVolume2 },
    { href: "/admin/orders", label: "Commandes", icon: FiClipboard },
    { href: "/admin/suppliers", label: "Fournisseurs", icon: FiTruck },
    { href: "/admin/users", label: "Utilisateurs", icon: FiUsers },
    { href: "/admin/whatsapp", label: "WhatsApp & Messages", icon: FiMessageCircle },
  ];

  // Sidebar desktop (md+) et drawer mobile
  return (
    <>
      {/* Sidebar desktop */}
      <div className={`fixed left-0 top-0 bottom-0 z-30 bg-gradient-to-b from-amber-600 via-orange-600 to-amber-700/95 text-white ${isCollapsed ? 'w-16' : 'w-64'} h-screen border-r border-orange-200 transition-all duration-300 hidden md:flex flex-col shadow-xl backdrop-blur-sm`}> {/* glassy, fixed */}
        {/* En-tête de la sidebar */}
        <div className="p-4 border-b border-orange-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-amber-200 tracking-wide drop-shadow">Administration</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
              title={isCollapsed ? "Déplier" : "Réduire"}
            >
              {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className="mt-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 backdrop-blur-sm
                  ${isActive ? "bg-white/10 text-amber-200 font-bold" : "text-white/90 hover:bg-white/10 hover:text-amber-200"}
                `}
                onClick={onClose}
              >
                <span className="text-lg mr-3 flex-shrink-0">
                  <Icon className={isActive ? "text-amber-300" : "text-white"} size={22} />
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Sidebar mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-amber-600 via-orange-600 to-amber-700/95 text-white shadow-xl flex flex-col animate-slide-in-right backdrop-blur-sm">
            <div className="p-4 border-b border-orange-200 flex items-center justify-between">
              <h1 className="text-xl font-bold text-amber-200 tracking-wide drop-shadow">Administration</h1>
              <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300">
                <FiX size={22} />
              </button>
            </div>
            <nav className="mt-4 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 backdrop-blur-sm
                      ${isActive ? "bg-white/10 text-amber-200 font-bold" : "text-white/90 hover:bg-white/10 hover:text-amber-200"}
                    `}
                    onClick={onClose}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">
                      <Icon className={isActive ? "text-amber-300" : "text-white"} size={22} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar; 