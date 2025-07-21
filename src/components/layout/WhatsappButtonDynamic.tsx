"use client";
import { useEffect, useState } from "react";
import WhatsappButtonClient from "./WhatsappButtonClient";

export default function WhatsappButtonDynamic() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/whatsapp-config")
      .then(res => res.json())
      .then(data => setWhatsappNumber(data.whatsappNumber));
  }, []);

  if (!whatsappNumber) return null; // ou un loader

  return <WhatsappButtonClient whatsappNumber={whatsappNumber} />;
} 