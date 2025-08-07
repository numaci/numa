"use client";
import React, { useState } from 'react';
import { Product} from '@prisma/client';
import { Button } from '@/components/ui/Button';
import type { Product } from "@/types/admin";

export default function ProductValidationCard({ product }: { product: Product }) {
  const [showRefuse, setShowRefuse] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleValidate() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/products/${product.id}/validate`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur lors de la validation');
      setSuccess('Produit validé !');
    } catch (e) {
      setError('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefuse() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/products/${product.id}/refuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error('Erreur lors du refus');
      setSuccess('Produit refusé.');
    } catch (e) {
      setError('Erreur lors du refus');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card flex flex-col md:flex-row gap-6">
      <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
      <div className="flex-1">
        <div className="font-semibold text-xl text-black antialiased mb-2">{product.name}</div>
        <div className="text-sm text-black font-medium mb-1 antialiased">Prix : {product.price.toString()} FCFA</div>
        <div className="text-gray-700 mb-3 line-clamp-2 antialiased">{product.description}</div>
        {success && <div className="text-green-600 text-sm mb-2 antialiased font-medium">{success}</div>}
        {error && <div className="text-red-600 text-sm mb-2 antialiased font-medium">{error}</div>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleValidate} disabled={loading} className="admin-button admin-button-primary disabled:opacity-50">
            {loading ? 'Validation...' : 'Valider'}
          </button>
          <button onClick={() => setShowRefuse((v) => !v)} className="admin-button admin-button-secondary">
            Refuser
          </button>
        </div>
        {showRefuse && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <textarea
              className="admin-input mb-3"
              placeholder="Commentaire de refus (obligatoire)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
            <button 
              onClick={handleRefuse} 
              disabled={loading || !comment.trim()} 
              className="admin-button admin-button-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Refus...' : 'Confirmer le refus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}