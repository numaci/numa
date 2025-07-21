"use client";

import Header from "@/components/layout/Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import AdBar from "./AdBar";
import { FaWhatsapp } from "react-icons/fa";

// Layout principal pour la partie client
// Enveloppe toutes les pages client avec Header et Footer
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  
  return (
    <>
      <Header />
      <main className="flex-1 pt-[120px] md:pt-[20px]">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      {/* Bouton WhatsApp flottant visible partout */}
    </>
  );
} 