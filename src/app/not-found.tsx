"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { prisma } from "@/lib/prisma";

export default async function NotFound() {
  // Récupérer le numéro WhatsApp principal
  let whatsappNumber = "22300000000";
  try {
    const whatsappConfig = await prisma.whatsappConfig.findFirst({
      where: { isActive: true, type: "order" },
      orderBy: { createdAt: "desc" },
    });
    if (whatsappConfig?.number) whatsappNumber = whatsappConfig.number;
  } catch {}

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4 text-white font-bold drop-shadow">404</div>
        <h1 className="text-2xl font-bold text-white mb-2 drop-shadow">Page introuvable</h1>
        <p className="text-orange-100 mb-4">
          Oups, la page que vous cherchez n'existe pas ou a été déplacée.<br />
          Vérifiez l'URL ou revenez à l'accueil.<br />
          <span className="block mt-2">Besoin d'aide ?</span>
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/" className="inline-block bg-white/90 hover:bg-white text-amber-600 font-bold py-2 px-6 rounded-lg shadow transition border-2 border-white">
            Retour à l'accueil
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition border-2 border-green-600 mt-2"
          >
            <FaWhatsapp size={22} />
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
} 