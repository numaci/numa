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

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
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
    if (!file) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('imageUrl', file);
    formData.append('link', link);

    try {
      await axios.post('/api/ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Publicité ajoutée avec succès!');
      setFile(null);
      setLink('');
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
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
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
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
 