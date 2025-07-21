import { prisma } from "@/lib/prisma";
import WhatsappButtonClient from "./WhatsappButtonClient";

export default async function WhatsappButtonServer() {
  let whatsappNumber = "";
  const config = await prisma.whatsappConfig.findFirst({
    where: { isActive: true, type: "order" },
    orderBy: { createdAt: "desc" },
  });
  if (config) {
    whatsappNumber = config.number.replace(/\D/g, "");
    if (whatsappNumber.length <= 9 && !whatsappNumber.startsWith("223")) {
      whatsappNumber = `223${whatsappNumber}`;
    }
  }
  return <WhatsappButtonClient whatsappNumber={whatsappNumber} />;
} 