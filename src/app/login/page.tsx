'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrPhone || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email/téléphone ou mot de passe incorrect');
      } else {
        toast.success('Connexion réussie !');
        
        // Récupérer la session pour vérifier le rôle
        const session = await getSession();
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black">Se connecter</h2>
          <p className="mt-2 text-gray-600">Accédez à votre compte</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Toggle Email/Phone */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  useEmail
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setUseEmail(false)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  !useEmail
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Téléphone
              </button>
            </div>

            {/* Email ou Téléphone */}
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                {useEmail ? 'Email' : 'Numéro de téléphone'}
              </label>
              <input
                id="emailOrPhone"
                name="emailOrPhone"
                type={useEmail ? 'email' : 'tel'}
                required
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className="admin-input"
                placeholder={useEmail ? 'votre@email.com' : '70123456'}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-gray-600 hover:text-black hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="admin-button admin-button-primary w-full"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link href="/register" className="font-medium text-black hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
