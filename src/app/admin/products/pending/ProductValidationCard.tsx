"use client";
import React, { useState } from 'react';
import { Product, Supplier } from '@prisma/client';
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
    <div className="border rounded-lg p-4 bg-white shadow flex flex-col md:flex-row gap-4">
      <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="w-32 h-32 object-cover rounded" />
      <div className="flex-1">
        <div className="font-semibold text-lg">{product.name}</div>
        <div className="text-sm text-gray-500 mb-2">Catégorie : {product.category?.name || 'N/A'}</div>
        <div className="text-sm text-gray-500 mb-2">Prix : {product.price.toString()} XOF</div>
        <div className="text-sm text-gray-500 mb-2">Fournisseur : {product.supplier?.name || 'N/A'} ({product.supplier?.email})</div>
        <div className="text-gray-700 mb-2 line-clamp-2">{product.description}</div>
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleValidate} disabled={loading} variant="success">Valider</Button>
          <Button onClick={() => setShowRefuse((v) => !v)} variant="destructive">Refuser</Button>
        </div>
        {showRefuse && (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Commentaire de refus (obligatoire)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
            />
            <Button onClick={handleRefuse} disabled={loading || !comment.trim()} variant="destructive">Confirmer le refus</Button>
          </div>
        )}
      </div>
    </div>
  );
} 