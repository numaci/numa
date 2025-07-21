import ClientLayout from "@/components/layout/ClientLayout";
import WhatsappCollectForm from './WhatsappCollectForm';
import ClientTransitionWrapper from "@/components/layout/ClientTransitionWrapper";

import type { ReactNode } from "react";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
// On importe le composant client qui affiche le CartDrawer
import ClientDrawerRoot from "@/components/layout/ClientDrawerRoot";
import WhatsappButtonDynamic from "@/components/layout/WhatsappButtonDynamic";

export default function ClientRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WhatsappCollectForm />
      <WhatsappButtonDynamic />
      <CartDrawerProvider>
        <ClientTransitionWrapper>
          <ClientLayout>{children}</ClientLayout>
          <ClientDrawerRoot />
        </ClientTransitionWrapper>
      </CartDrawerProvider>
    </>
  );
} 