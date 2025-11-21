"use client";

import { useEffect, useState } from "react";
import WhatsappButtonClient from "./WhatsappButtonClient";

// Normalize any phone number to wa.me compatible: digits only, no leading +
function normalizeToWaMe(num: string): string {
  const digits = (num || "").replace(/\D/g, "");
  return digits; // wa.me expects international format without '+'
}

export default function WhatsappButtonDynamic() {
  // Fallback number provided by user
  const FALLBACK = "2250700247693"; // Côte d'Ivoire format already with country code
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(normalizeToWaMe(FALLBACK));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/whatsapp-config");
        if (!res.ok) {
          if (active) setWhatsappNumber(normalizeToWaMe(FALLBACK));
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text().catch(() => "");
          if (!text) {
            if (active) setWhatsappNumber(normalizeToWaMe(FALLBACK));
            return;
          }
          try {
            const data = JSON.parse(text);
            const num = data?.whatsappNumber ? normalizeToWaMe(String(data.whatsappNumber)) : normalizeToWaMe(FALLBACK);
            if (active) setWhatsappNumber(num);
          } catch {
            if (active) setWhatsappNumber(normalizeToWaMe(FALLBACK));
          }
          return;
        }

        const data = await res.json().catch(() => null);
        const num = data?.whatsappNumber ? normalizeToWaMe(String(data.whatsappNumber)) : normalizeToWaMe(FALLBACK);
        if (active) setWhatsappNumber(num);
      } catch (e) {
        // Use fallback on error
        if (active) setWhatsappNumber(normalizeToWaMe(FALLBACK));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!whatsappNumber) return null;

  return <WhatsappButtonClient whatsappNumber={whatsappNumber} />;
}