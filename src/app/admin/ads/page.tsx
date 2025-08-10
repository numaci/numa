import { prisma } from "@/lib/prisma";
"use client";

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/admin/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AdsTable from './AdsTable';
import { Ad } from '@prisma/client';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/ads');
      setAds(response.data);
    } catch (error) {
      toast.error('Impossible de charger les publicités.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Veuillez téléverser une image.');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/ads', { imageUrl, link });
      toast.success('Publicité ajoutée avec succès!');
      setImageUrl("");
      setLink('');
      fetchAds(); // Refresh the list
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la publicité.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité?')) {
      try {
        await axios.delete(`/api/ads/${id}`);
        toast.success('Publicité supprimée.');
        fetchAds(); // Refresh the list
      } catch (error) {
        toast.error('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Gestion des Publicités" />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle publicité</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <ImageUpload
              onUpload={(url) => setImageUrl(url)}
              value={imageUrl}
              folder="ads"
            />
          </div>
          <div>
            <label htmlFor="link-input" className="block text-sm font-medium text-gray-700 mb-1">Lien de redirection (optionnel)</label>
            <Input
              id="link-input"
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemple.com/produit"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter la publicité'}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Publicités Actuelles</h3>
        {isLoading ? (
          <p>Chargement...</p>
        ) : (
          <AdsTable ads={ads} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
 