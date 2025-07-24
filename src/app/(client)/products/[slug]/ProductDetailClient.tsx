"use client";
import ProductDetailInfo from "@/components/shop/ProductDetailInfo";

export default function ProductDetailClient({ product, whatsappNumber }: { product: unknown; whatsappNumber: unknown }) {
  return <ProductDetailInfo product={product} whatsappNumber={whatsappNumber} />;
} 