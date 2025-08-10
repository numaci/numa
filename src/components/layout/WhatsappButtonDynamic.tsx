"use client";
import { useEffect, useState } from "react";
import WhatsappButtonClient from "./WhatsappButtonClient";

export default function WhatsappButtonDynamic() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/whatsapp-config")
        if (!res.ok) return

        // Some environments may return empty body (204) or non-JSON on error
        const contentType = res.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) {
          const text = await res.text().catch(() => "")
          if (!text) return
          try {
            const data = JSON.parse(text)
            if (active && data?.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
          } catch {
            // ignore invalid JSON
          }
          return
        }

        const data = await res.json().catch(() => null)
        if (active && data?.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
      } catch (e) {
        // Silent fail: component remains hidden if no config
        console.warn("[WhatsappButton] config fetch failed", e)
      }
    })()

    return () => {
      active = false
    }
  }, []);

  if (!whatsappNumber) return null; // ou un loader

  return <WhatsappButtonClient whatsappNumber={whatsappNumber} />;
}