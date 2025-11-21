"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+225',
    address: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasPrefilledEmail, setHasPrefilledEmail] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setFormData((prev) => ({ ...prev, fullName: session.user.name || '' }));
    }
    if (session?.user?.email) {
      setFormData((prev) => ({ ...prev, email: session.user?.email || '' }));
      setHasPrefilledEmail(true);
    } else {
      setHasPrefilledEmail(false);
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && !value.startsWith('+225')) {
      return; // Basic validation to enforce prefix
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Si l'utilisateur n'est pas connecté, on redirige vers /login
    if (!session?.user) {
      router.push('/login');
      return;
    }
    if (!formData.fullName || !formData.phone || !formData.address) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    // Si l'email n'est pas prérempli depuis la session, l'utilisateur doit le saisir
    if (!hasPrefilledEmail) {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Veuillez saisir un email valide pour recevoir la confirmation de commande.");
        return;
      }
    }
    if (formData.phone.length < 13) { // +225 XX XX XX XX
        setError('Le numéro de téléphone semble invalide.');
        return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/commande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, items, totalPrice }),
      });

      if (!response.ok) {
        // Essayer de récupérer le message d'erreur depuis la réponse
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'La création de la commande a échoué.');
      }

      clearCart();
      router.push('/confirmation'); // Redirect to a confirmation page
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${inter.className} bg-white min-h-screen`}>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6 sm:mb-8">Finaliser ma commande</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-lg font-medium text-gray-800 mb-2">Nom complet</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black transition-all ${hasPrefilledEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="votre@email.com"
                  required={!hasPrefilledEmail}
                  readOnly={hasPrefilledEmail}
                />
                {!hasPrefilledEmail && (
                  <p className="mt-2 text-sm text-gray-600">Saisissez votre email pour recevoir la confirmation de commande.</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-lg font-medium text-gray-800 mb-2">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-lg font-medium text-gray-800 mb-2">Adresse de livraison</label>
                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>
            </form>
          </div>

          {/* Summary and Payment Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-medium text-black mb-4">Résumé</h2>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Livraison</span>
                        <span>Gratuite</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between text-xl font-bold text-black">
                        <span>Total</span>
                        <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-medium text-black mb-4">Méthode de paiement</h2>
                <div className="bg-gray-100 text-black rounded-md p-4 flex items-center">
                    <span className="text-2xl mr-3">💵</span>
                    <div>
                        <p className="font-medium">Paiement à la livraison</p>
                        <p className="text-sm text-gray-600">Payez en espèces à la réception.</p>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-black text-white text-lg font-semibold py-4 rounded-md hover:opacity-80 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Validation en cours...' : 'Valider la commande'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
