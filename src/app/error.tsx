"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useMemo } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  // Numéro WhatsApp fixé à la demande du client
  const whatsappUrl = useMemo(() => `https://wa.me/${"+2250700247693".replace('+', '')}`, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 via-white to-gray-50 px-4">
      <div className="rounded-2xl shadow-xl p-8 max-w-md w-full text-center bg-gray-900 text-white border border-gray-800">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">Oups, une erreur est survenue</h1>
        <p className="text-gray-300 mb-4">
          Le service est momentanément indisponible.<br />
          Merci de réessayer dans quelques instants.<br />
          Si le problème persiste, contactez le support.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => reset()}
            className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2 px-6 rounded-lg shadow transition border border-gray-300"
          >
            Réessayer
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white rounded-full w-10 h-10 shadow transition border border-gray-700 mt-2"
            title="Nous contacter sur WhatsApp"
          >
            <FaWhatsapp size={22} />
          </a>
        </div>
      </div>
    </div>
  );
}