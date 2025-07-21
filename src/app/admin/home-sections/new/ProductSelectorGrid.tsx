"use client";
import { useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "/placeholder.png";

type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  category?: { id: string; name: string } | null;
};
type Category = { id: string; name: string };

export default function ProductSelectorGrid({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<string>("");
  const filtered = products.filter(p => {
    const matchText = filter.trim().length === 0 || p.name.toLowerCase().includes(filter.toLowerCase());
    const matchCat = !category || (p.category && p.category.id === category);
    return matchText && matchCat;
  });
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="border rounded px-3 py-2 flex-1"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full sm:w-56"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <label
            key={product.id}
            className="group cursor-pointer border rounded-lg p-2 flex flex-col items-center transition-shadow hover:shadow-lg bg-white"
          >
            <Image
              src={product.imageUrl || PLACEHOLDER}
              alt={product.name}
              width={120}
              height={120}
              className="object-cover rounded mb-2 w-24 h-24 border"
            />
            <span className="text-sm font-medium text-center mb-1 line-clamp-2">{product.name}</span>
            <input
              type="checkbox"
              name="products"
              value={product.id}
              className="mt-1"
            />
          </label>
        ))}
      </div>
    </>
  );
} 