"use client";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsappButtonClient({ whatsappNumber }: { whatsappNumber: string }) {
  if (!whatsappNumber) return null;
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-3 flex items-center justify-center animate-bounce
        right-2 top-1/2 -translate-y-1/2 md:bottom-4 md:right-4 md:top-auto md:translate-y-0"
      style={{ width: 'auto' }}
      title="Commander sur WhatsApp"
    >
      <span className="block md:hidden"><FaWhatsapp size={24} /></span>
      <span className="hidden md:block"><FaWhatsapp size={32} /></span>
    </a>
  );
} 