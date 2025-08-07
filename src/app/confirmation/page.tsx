"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

export default function ConfirmationPage() {
  const { clearCart } = useCart();

  // Ensure the cart is cleared when the user lands here, just in case.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-white min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-lg mx-auto">
        <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">Merci pour votre commande !</h1>
        <p className="text-lg text-gray-700 mb-8">
          Votre commande a été reçue avec succès. Nous vous contacterons sous peu pour confirmer les détails de la livraison.
        </p>
        <Link href="/" className="bg-black text-white text-lg font-semibold py-3 px-8 rounded-md hover:opacity-80 transition-all">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
