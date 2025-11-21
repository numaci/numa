import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
  // Optional variant/size information
  variantId?: string;
  variantName?: string; // e.g., "Taille"
  variantValue?: string; // e.g., "M"
  availableVariants?: Array<{ id: string; value: string; name?: string; price: number; stock: number }>;
  comparePrice?: number;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateVariant: (productId: string, variantId: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addToCart: (item, quantity) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            // Mise à jour de la quantité, sans dépasser le stock
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i
              ),
            };
          } else {
            return {
              items: [
                ...state.items,
                { ...item, quantity: Math.min(quantity, item.stock) },
              ],
            };
          }
        });
      },
      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        })),
      updateVariant: (productId, variantId) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId) return i;
            const variants = i.availableVariants || [];
            const v = variants.find((vv) => vv.id === variantId);
            if (!v) return i;
            // Update variant fields, price and stock, and keep quantity within stock
            const newStock = v.stock;
            const newQuantity = Math.max(1, Math.min(i.quantity, newStock));
            const variantName = i.variantName || variants[0]?.name || "Taille";
            return {
              ...i,
              variantId: v.id,
              variantValue: v.value,
              variantName,
              price: v.price,
              stock: newStock,
              quantity: newQuantity,
              // Optionally adjust the display name to include variant for clarity
              name: i.name.replace(/\s*\([^()]*\)$/, "") + ` (${variantName}: ${v.value})`,
            };
          }),
        })),
      clearCart: () => set({ items: [] }),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    {
      name: "cart-storage",
    }
  )
); 