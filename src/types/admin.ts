// Types pour l'administration de l'e-commerce

// Types pour les produits
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
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

// Types pour les commandes
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  shippingAddress: unknown;
  deliveryZone: unknown;
  paymentInfo: unknown;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  orderItems: OrderItem[];
}

// Types pour les articles de commande
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  sku: string | null;
  product: Product;
}

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  cartItems: CartItem[];
  addresses: Address[];
  reviews: Review[];
}

// Types pour les articles du panier
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: Product;
}

// Types pour les adresses
export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types pour les avis
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
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