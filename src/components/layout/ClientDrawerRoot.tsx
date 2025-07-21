"use client";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import CartDropdown from "@/components/layout/CartDropdown";

export default function ClientDrawerRoot() {
  const { isCartOpen, closeCart } = useCartDrawer();
  return <CartDropdown open={isCartOpen} onClose={closeCart} />;
} 