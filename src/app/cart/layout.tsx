import ClientLayout from "@/components/layout/ClientLayout";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartDrawerProvider>
      <ClientLayout>{children}</ClientLayout>
    </CartDrawerProvider>
  );
} 