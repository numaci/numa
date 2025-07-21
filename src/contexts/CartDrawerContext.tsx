"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Type du contexte
export type CartDrawerContextType = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => {
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartDrawerContext.Provider value={{ isCartOpen, openCart, closeCart }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  return context;
} 