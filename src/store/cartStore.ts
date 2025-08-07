import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
      clearCart: () => set({ items: [] }),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    {
      name: "cart-storage",
    }
  )
); 