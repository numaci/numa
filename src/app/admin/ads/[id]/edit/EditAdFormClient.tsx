"use client";
import { useRouter } from "next/navigation";
import AdForm, { AdFormValues } from "@/components/admin/ads/AdForm";

export default function EditAdFormClient({ ad, products, adId }: { ad: any, products: any[], adId: string }) {
  const router = useRouter();

  async function handleSubmit(values: AdFormValues) {
    await fetch(`/api/admin/ads/${adId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    router.push('/admin/ads');
  }

  return (
    <AdForm initialValues={ad} onSubmit={handleSubmit} products={products} />
  );
} 