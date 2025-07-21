import Link from "next/link";

// Composant Footer pour la partie client
// Inclut les liens utiles, informations de contact et réseaux sociaux
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border-t border-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center flex flex-col items-center gap-2">
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Sikasso Sugu. Tous droits réservés.
          {/* Optionnel : lien contact ou mentions légales */}
          <span className="mx-2">|</span>
          <Link href="/contact" className="underline text-amber-600 hover:text-amber-800 transition-colors">Contact</Link>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-amber-600 text-2xl transition-colors">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 2h2.25c.14 1.2.8 4.5 4.25 4.5v2.25c-.7.07-2.1-.02-3.25-.75v7.5c0 3.25-2.5 5.25-5.25 5.25S5 18.75 5 15.5 7.5 10.25 10.25 10.25c.25 0 .5.02.75.05v2.3c-.23-.05-.48-.08-.75-.08-1.5 0-2.75 1.25-2.75 3s1.25 3 2.75 3 2.75-1.25 2.75-3V2z"/></svg>
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-amber-600 text-2xl transition-colors">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2.1v3.2c0 .4.3.7.7.7h2.1v3.2h-2.8c-.6 0-1 .4-1 1v2.1h3.7l-.5 3.2h-3.2v8.5h-3.3v-8.5h-2.1v-3.2h2.1V7.2c0-2.1 1.3-3.2 3.2-3.2h2.1z"/></svg>
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-amber-600 text-2xl transition-colors">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.09-1.33A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.61 0-3.13-.49-4.41-1.34l-.31-.2-3.02.79.81-2.95-.2-.31A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.43-5.34c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.12-.12.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.28-.22.22-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.2 3.59.59.2 1.05.32 1.41.41.59.15 1.13.13 1.56.08.48-.06 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
} 