import { prisma } from "@/lib/prisma";
import WhatsappButtonClient from "./WhatsappButtonClient";

export default async function WhatsappButtonServer() {
  let whatsappNumber = "";
  try {
    const config = await prisma.whatsappConfig.findFirst({
      where: { isActive: true, type: "order" },
      orderBy: { createdAt: "desc" },
    });
    if (config?.number) {
      whatsappNumber = config.number.replace(/\D/g, "");
      if (whatsappNumber.length <= 9 && !whatsappNumber.startsWith("223")) {
        whatsappNumber = `223${whatsappNumber}`;
      }
      whatsappNumber = `+${whatsappNumber}`;
    }
  } catch (e) {
    console.error('[WhatsappButtonServer] DB error:', e);
  }
  return <WhatsappButtonClient whatsappNumber={whatsappNumber} />;
}