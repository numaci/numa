export const BRAND = {
  name: process.env.BRAND_NAME || "NUMA",
  phone: process.env.BRAND_PHONE || "+225 07 00 24 76 93",
  url: process.env.APP_PUBLIC_URL || "http://numaci.com",
};

export const SOCIAL = {
  gmail: process.env.SOCIAL_GMAIL_URL || "mailto:numa7433@gmail.com",
  whatsapp: process.env.SOCIAL_WHATSAPP_URL || "https://wa.me/2250700247693",
  facebook: "https://www.facebook.com/share/1BrrZwNqzz/?mibextid=wwXIfr",
  tiktok: process.env.SOCIAL_TIKTOK_URL || "https://www.tiktok.com/@numastyle2025",
  instagram: process.env.SOCIAL_INSTAGRAM_URL || "https://www.instagram.com/numaci2025?igsh=N3N3M2VhY2F3ZzFm&utm_source=q",
};

export const SOCIAL_LINKS: { name: "Gmail" | "WhatsApp" | "Facebook" | "TikTok" | "Instagram"; href: string }[] = [
  { name: "Gmail", href: SOCIAL.gmail },
  { name: "WhatsApp", href: SOCIAL.whatsapp },
  { name: "Facebook", href: SOCIAL.facebook },
  { name: "TikTok", href: SOCIAL.tiktok },
  { name: "Instagram", href: SOCIAL.instagram },
];
