// Types pour les commandes et les données associées, utilisés dans l'interface d'administration.

// Role pour les utilisateurs
export type Role = "USER" | "ADMIN";

// Statut de la commande
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

// Statut du paiement
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

// Type pour les champs JSON qui peuvent être mal formés
export type ParsedJson<T> = T | { raw: string };

// --- Interfaces pour les données parsées et sérialisées (utilisées côté client) ---

// Informations utilisateur simplifiées pour l'affichage
export interface SimpleUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

// Produit dans un item de commande
export interface OrderItemProduct {
  id: string;
  name: string;
  imageUrl: string | null; // L'URL de l'image principale
  sku: string | null; // Le SKU du produit
  stock: number;
}

// Item de commande côté client
export interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Converti en nombre
  product: OrderItemProduct;
}

// Adresse de livraison (après parsing)
export interface ShippingAddress {
  name?: string; // Nom sur l'adresse, ex: Domicile
  address?: string; // Ligne d'adresse principale
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  gps?: { lat: number; lng: number };
  [key: string]: any;
}

// Zone de livraison (après parsing)
export interface DeliveryZone {
  name: string;
  price: number;
  deliveryFee?: number; // Frais de livraison (peut être redondant avec price)
  [key:string]: any;
}

// Informations de paiement (après parsing)
export interface PaymentInfo {
  provider: string;
  transactionId?: string;
  clientPhone?: string; // Numéro de téléphone pour le paiement
  receiptImage?: string; // URL de l'image du reçu
  [key: string]: any;
}

// Interface principale pour la Commande (utilisée dans la page de détails admin)
export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  user: SimpleUser;
  orderItems: OrderItem[];
  shippingAddress: ParsedJson<ShippingAddress>;
  deliveryZone: ParsedJson<DeliveryZone>;
  paymentInfo: ParsedJson<PaymentInfo>;
  // Les champs suivants n'existent pas dans le schema.prisma et ont été retirés:
  // paymentMethod: string;
  // paymentStatus: PaymentStatus;
  // customerNotes: string | null;
  // deliveryDate: string | null;
}
