import { useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';

// This hook is now a simple wrapper around the Zustand store.
// All logic, including persistence, is handled by the store.
// There is no more database synchronization.

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading: false, // No server interaction for cart
    error: null,      // No server interaction for cart
    totalItems,
    totalPrice,
  };
}