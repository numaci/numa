"use client";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsappButtonClient({ whatsappNumber }: { whatsappNumber: string }) {
  if (!whatsappNumber) return null;
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 bg-black hover:bg-gray-800 text-white rounded-full shadow-md p-3 flex items-center justify-center transition-all duration-300 hover:scale-105
        right-4 bottom-4 md:bottom-8 md:right-8"
      style={{ width: 'auto' }}
      title="Commander sur WhatsApp"
    >
      <span className="block md:hidden"><FaWhatsapp size={20} /></span>
      <span className="hidden md:block"><FaWhatsapp size={24} /></span>
    </a>
  );
}