// Types pour l'administration de l'e-commerce

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
  images: string[];
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
  [key:string]: any;
}

// Informations de paiement (après parsing)
export interface PaymentInfo {
  provider: string;
  transactionId?: string;
  [key: string]: any;
}

// Interface principale pour la Commande (utilisée dans la page de détails admin)
export interface Order {
  id: string;
  orderNumber: number;
  total: number; // Converti en nombre
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  user: SimpleUser;
  orderItems: OrderItem[];
  shippingAddress: ParsedJson<ShippingAddress>;
  deliveryZone: ParsedJson<DeliveryZone> | null;
  paymentInfo: ParsedJson<PaymentInfo> | null;
  customerNotes: string | null;
  deliveryDate?: string | null;
}


// --- Interfaces de base (plus proches du schéma Prisma) ---

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  imageUrl: string | null;
  images: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: Role;
  emailVerified: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  orders: any[]; // Utiliser un type OrderSummary si nécessaire
  cartItems: CartItem[];
  addresses: Address[];
  reviews: Review[];
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  product: Product;
}

// Types pour les formulaires
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  sku: string;
  weight: string;
  dimensions: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
  images: string[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  imageUrl: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les filtres
export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | 'outOfStock' | 'lowStock';
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Types pour les statistiques
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  topSellingProducts: {
    product: Product;
    totalSold: number;
    revenue: number;
  }[];
}

// Énumérations
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}





export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING"
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Types pour les actions de l'interface
export interface TableAction {
  label: string;
  icon: string;
  action: (id: string) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Types pour les colonnes de tableau
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
}

// Types pour les options de pagination
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Types pour les options de tri
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Types pour les options de filtrage
export interface FilterOptions {
  field: string;
  value: unknown;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'in' | 'notIn';
} 