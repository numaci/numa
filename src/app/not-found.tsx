import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { prisma } from "@/lib/prisma";

export default async function NotFound() {
  // Forcer le numéro WhatsApp demandé par le client
  const whatsappNumber = "+2250700247693";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 via-white to-gray-50 px-4">
      <div className="rounded-2xl shadow-xl p-8 max-w-md w-full text-center bg-gray-900 text-white border border-gray-800">
        <div className="text-6xl mb-4 font-bold">404</div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-gray-300 mb-4">
          Oups, la page que vous cherchez n'existe pas ou a été déplacée.<br />
          Vérifiez l'URL ou revenez à l'accueil.<br />
          <span className="block mt-2">Besoin d'aide ?</span>
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow transition border border-gray-300">
            Retour à l'accueil
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg shadow transition border border-gray-700 mt-2"
          >
            <FaWhatsapp size={22} />
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}