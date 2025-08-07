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
    { href: "/admin/users", label: "Utilisateurs", icon: FiUsers },
    { href: "/admin/whatsapp", label: "WhatsApp & Messages", icon: FiMessageCircle },
  ];

  // Sidebar desktop (md+) et drawer mobile
  return (
    <>
      {/* Sidebar desktop */}
      <div className={`admin-sidebar ${isCollapsed ? 'admin-sidebar-collapsed' : ''}`}>
        {/* En-tête de la sidebar */}
        <div className="admin-sidebar-header">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-semibold text-black tracking-tight antialiased">Administration</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="admin-button-secondary p-2 rounded-xl hover:scale-105"
              title={isCollapsed ? "Déplier" : "Réduire"}
            >
              {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className="mt-6 flex-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${
                  isActive ? "admin-sidebar-link-active" : "admin-sidebar-link-inactive"
                }`}
                onClick={onClose}
              >
                <span className="text-lg mr-3 flex-shrink-0">
                  <Icon size={22} />
                </span>
                {!isCollapsed && <span className="antialiased">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Sidebar mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white text-black shadow-xl flex flex-col animate-slide-in-right">
            <div className="admin-sidebar-header flex items-center justify-between">
              <h1 className="text-xl font-semibold text-black tracking-tight antialiased">Administration</h1>
              <button onClick={onClose} className="admin-button-secondary p-2 rounded-xl hover:scale-105">
                <FiX size={22} />
              </button>
            </div>
            <nav className="mt-6 flex-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-sidebar-link ${
                      isActive ? "admin-sidebar-link-active" : "admin-sidebar-link-inactive"
                    }`}
                    onClick={onClose}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">
                      <Icon size={22} />
                    </span>
                    <span className="antialiased">{item.label}</span>
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