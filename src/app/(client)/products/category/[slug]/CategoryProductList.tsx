"use client";
import { useEffect, useState, useTransition } from "react";
import ProductGrid from "@/components/shop/ProductGrid";
import Pagination from "@/components/admin/products/Pagination";

interface CategoryProductListProps {
  categoryId: string;
  searchParams: { [key: string]: string | undefined };
  category: any;
}

const PAGE_SIZE = 12;

function transformProduct(product: any) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };
}

export default function CategoryProductList({ categoryId, searchParams, category }: CategoryProductListProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Pagination
  const page = parseInt(searchParams.page || "1");

  // Fetch products à chaque changement de page
  useEffect(() => {
    startTransition(() => {
      const url = `/api/products?categoryId=${categoryId}&page=${page}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setProducts(data.products.map(transformProduct));
          setTotal(data.total);
        });
    });
  }, [categoryId, page]);



  // Handler pour pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set("page", newPage.toString());
    window.location.search = params.toString();
  };

  return (
    <div className="w-full">
      <main className="flex-1">
        <ProductGrid products={products} />
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / PAGE_SIZE)}
          totalItems={total}
          itemsPerPage={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
} 