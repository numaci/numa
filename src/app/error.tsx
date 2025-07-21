"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const [whatsappNumber, setWhatsappNumber] = useState("66434050");

  useEffect(() => {
    // Appel API pour récupérer le numéro WhatsApp principal (API dédiée qui retourne { number })
    fetch("/api/whatsapp/number")
      .then(res => res.json())
      .then(data => {
        if (data?.number) setWhatsappNumber(data.number);
      })
      .catch(() => {});
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4 text-white">😕</div>
        <h1 className="text-2xl font-bold text-white mb-2 drop-shadow">Oups, une erreur est survenue</h1>
        <p className="text-orange-100 mb-4">
          Le service est momentanément indisponible.<br />
          Merci de réessayer dans quelques instants.<br />
          Si le problème persiste, contactez le support.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => reset()}
            className="bg-white/90 hover:bg-white text-amber-600 font-bold py-2 px-6 rounded-lg shadow transition border-2 border-white"
          >
            Réessayer
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 shadow transition border-2 border-green-600 mt-2"
            title="Nous contacter sur WhatsApp"
          >
            <FaWhatsapp size={22} />
          </a>
        </div>
      </div>
    </div>
  );
} 