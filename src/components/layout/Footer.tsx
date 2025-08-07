import Link from "next/link";
import React from "react";
import {
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";

const socialLinks = [
  { name: "Gmail", href: "mailto:numa7433@gmail.com" },
  { name: "WhatsApp", href: "https://wa.me/2250700247693" },
  { name: "Facebook", href: "https://www.facebook.com/share/1KbQUNLiF3/?mibextid=wwXIfr" },
  { name: "TikTok", href: "https://www.tiktok.com/@numastyle2025" },
  { name: "Instagram", href: "https://www.instagram.com/numa_shop123" },
];

const renderIcon = (name: string) => {
  switch (name) {
    case "Gmail":
      return <FaEnvelope size={22} />;
    case "WhatsApp":
      return <FaWhatsapp size={22} />;
    case "Facebook":
      return <FaFacebook size={22} />;
    case "TikTok":
      return <FaTiktok size={22} />;
    case "Instagram":
      return <FaInstagram size={22} />;
    default:
      return null;
  }
};

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* 1. Bloc Marque et Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xl font-bold tracking-tight">NUMA</div>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Luxe, sobriété, authenticité.
            </p>
            <p className="text-gray-500 text-xs mt-auto pt-8">
              &copy; {new Date().getFullYear()} NUMA. Tous droits réservés.
            </p>
          </div>

          {/* 2. Bloc Navigation */}
          <div>
            <h3 className="text-md font-semibold tracking-wider uppercase text-gray-300">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3">
               <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  Sélection NUMA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contactez-nous
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Bloc Coordonnées */}
          <div>
            <h3 className="text-md font-semibold tracking-wider uppercase text-gray-300">
              Coordonnées
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:numa7433@gmail.com"
                  className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaEnvelope />
                  <span>numa7433@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/2250700247693"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaWhatsapp />
                  <span>+225 0700247693</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Bloc Réseaux Sociaux */}
          <div>
            <h3 className="text-md font-semibold tracking-wider uppercase text-gray-300">
              Suivez-nous
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {renderIcon(social.name)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}