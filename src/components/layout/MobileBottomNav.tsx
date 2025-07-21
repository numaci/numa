import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Accueil',
    href: '/',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" stroke={active ? '#f59e42' : '#6B7280'} strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l8.485-7.071a2 2 0 012.828 0L21 12M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>
    ),
  },
  {
    label: 'Catégories',
    href: '/categories',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" stroke={active ? '#f59e42' : '#6B7280'} strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
    ),
  },
  {
    label: 'Commandes',
    href: '/orders',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" stroke={active ? '#f59e42' : '#6B7280'} strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h6"/>
        <rect x="4" y="4" width="16" height="16" rx="2"/>
      </svg>
    ),
  },
  {
    label: 'Compte',
    href: '/profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" fill="none" stroke={active ? '#f59e42' : '#6B7280'} strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 shadow-2xl rounded-t-2xl border-t border-amber-200 z-50 md:hidden">
      <ul className="flex justify-between items-center px-2 py-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 transition-all duration-150 ${active ? 'scale-110' : 'hover:scale-105'} group`}
              >
                {item.icon(active)}
                <span className={`text-xs mt-0.5 font-semibold ${active ? 'text-amber-700' : 'text-amber-100 group-hover:text-white'}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 