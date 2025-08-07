"use client";

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setResponseMessage('');

    if (!name || !email || !message) {
        setStatus('error');
        setResponseMessage('Veuillez remplir tous les champs obligatoires.');
        return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResponseMessage(data.message || 'Votre message a bien été envoyé !');
        // Réinitialiser le formulaire
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setStatus('error');
        setResponseMessage(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contactez-nous</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Une question ou une suggestion ? N'hésitez pas à nous écrire.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Nom complet <span className="text-red-500">*</span></label>
            <div className="mt-2.5">
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Votre nom et prénom"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email <span className="text-red-500">*</span></label>
            <div className="mt-2.5">
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@exemple.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-gray-900">Téléphone <span className="text-gray-500">(Optionnel)</span></label>
            <div className="mt-2.5">
              <Input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07 00 00 00 00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message <span className="text-red-500">*</span></label>
            <div className="mt-2.5">
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Écrivez votre message ici..."
              />
            </div>
          </div>
          <div className="mt-8">
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
            </Button>
          </div>
          {responseMessage && (
            <div className={`mt-4 text-center p-3 rounded-md text-sm ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {responseMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
