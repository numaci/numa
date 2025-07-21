"use client";
import AdForm, { AdFormValues } from '@/components/admin/ads/AdForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewAdPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/admin/products?autocomplete=1')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []));
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data.categories) ? data.categories : []));
  }, []);

  async function handleSubmit(values: AdFormValues) {
    await fetch('/api/admin/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    router.push('/admin/ads');
  }

  return (
    <AdForm onSubmit={handleSubmit} products={products} categories={categories} />
  );
} 