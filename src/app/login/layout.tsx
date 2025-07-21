import ClientLayout from "@/components/layout/ClientLayout";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

export default function LoginLayout({
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