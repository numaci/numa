import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fonction utilitaire pour combiner les classes CSS
// Utilise clsx pour la logique conditionnelle et twMerge pour résoudre les conflits Tailwind
// Exemple: cn('text-red-500', isActive && 'text-blue-500') => 'text-blue-500'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour formater les prix Decimal de Prisma
// Convertit les objets Decimal de Prisma en chaînes formatées avec 2 décimales
export function formatPrice(price: unknown): string {
  // Gestion des valeurs nulles ou undefined
  if (price === null || price === undefined) {
    return '0.00'
  }
  
  // Si c'est un objet Decimal de Prisma (type object)
  if (typeof price === 'object' && price !== null) {
    return Number(price).toFixed(2) // Conversion en nombre puis formatage
  }
  
  // Si c'est déjà un nombre ou une string
  const numPrice = Number(price)
  if (isNaN(numPrice)) {
    return '0.00' // Valeur par défaut si la conversion échoue
  }
  
  return numPrice.toFixed(2) // Formatage avec 2 décimales
}

// Fonction pour formater les prix avec le symbole de devise
// Combine formatPrice() avec le symbole de devise (par défaut: FCFA)
export function formatCurrency(price: unknown, currency: string = 'FCFA'): string {
  return `${formatPrice(price)} ${currency}`
}

// Fonction pour convertir les coordonnées décimales en format DMS
export function decimalToDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  
  const direction = isLatitude 
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

// Fonction pour formater les coordonnées GPS
export function formatGPS(latitude: number, longitude: number): string {
  const latDMS = decimalToDMS(latitude, true);
  const lngDMS = decimalToDMS(longitude, false);
  return `${latDMS} ${lngDMS}`;
}

// Fonction pour générer le lien Google Maps
export function getGoogleMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

// Fonction pour générer un lien de partage de commande
export function generateOrderShareLink(orderNumber: string, products: unknown[], shippingAddress: unknown): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/share/order/${orderNumber}`;
  
  // Créer un objet avec les données à partager
  const shareData = {
    orderNumber,
    products: (products as unknown[]).map((item: unknown) => ({
      name: (item as { name: string; quantity: number }).name,
      quantity: (item as { name: string; quantity: number }).quantity
    })),
    shippingAddress: {
      firstName: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).firstName,
      lastName: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).lastName,
      address1: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).address1,
      address2: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).address2,
      city: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).city,
      phone: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).phone,
      latitude: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).latitude,
      longitude: (shippingAddress as { firstName: string; lastName: string; address1: string; address2: string; city: string; phone: string; latitude: number; longitude: number }).longitude
    },
    createdAt: new Date().toISOString()
  };

  // Encoder les données en base64 pour les passer en paramètre
  const encodedData = btoa(JSON.stringify(shareData));
  
  return `${shareUrl}?data=${encodedData}`;
}

// Fonction pour décoder les données de partage
export function decodeShareData(encodedData: string): unknown {
  try {
    const decodedString = atob(encodedData);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Erreur lors du décodage des données:', error);
    return null;
  }
} 