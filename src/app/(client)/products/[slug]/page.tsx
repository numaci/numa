import { useCallback } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailImages from "@/components/shop/ProductDetailImages";
import ProductDetailClient from "./ProductDetailClient";
import SimilarProducts from "@/components/shop/SimilarProducts";
import ProductBreadcrumbs from "@/components/shop/ProductBreadcrumbs";
import { FaShareAlt } from "react-icons/fa";
import ShareButtonClient from "./ShareButtonClient";
import { ImageKitProvider } from "@imagekit/next";

// Définir un type local pour le produit détaillé utilisé dans la page

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  shippingPrice: number | null;
  supplierPrice: number | null;
  stock: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  imageUrl: string | null;
  images: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isBest?: boolean;
  isHealth?: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviews: Array<{
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    user: {
      firstName?: string;
      lastName?: string;
    };
  }>;
  _count: {
    reviews: number;
  };
  attributes?: Record<string, unknown>;
  variants?: Array<{ id: string; name: string; value: string; price: number }>;
};

// Fonction pour convertir les objets Decimal/Date en types utilisables côté client
function transformProduct(product: Record<string, unknown>): ProductDetail {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice !== undefined && product.comparePrice !== null ? Number(product.comparePrice) : undefined,
    shippingPrice: product.shippingPrice ? Number(product.shippingPrice) : null,
    supplierPrice: product.supplierPrice ? Number(product.supplierPrice) : null,
    imageUrl: product.imageUrl ?? null,
    images: product.images ?? null,
    createdAt: product.createdAt?.toString() ?? "",
    updatedAt: product.updatedAt?.toString() ?? "",
    reviews: product.reviews
      ? (product.reviews as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
          ...r,
          createdAt: r.createdAt ? r.createdAt.toString() : "",
        }))
      : [],
    _count: product._count ?? { reviews: 0 },
    attributes: product.attributes ?? {},
    variants: product.variants
      ? (product.variants as Array<Record<string, unknown>>).map((v: Record<string, unknown>) => ({
          ...v,
          price: v.price ? Number(v.price) : 0,
        }))
      : [],
    category: {
      ...(product.category as Record<string, unknown>),
      slug: (product.category as Record<string, unknown>)?.slug ?? "",
    },
  };
}

// Fonction pour récupérer un produit par son slug
async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        slug,
        isActive: true,
        status: "PUBLISHED"
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
        variants: true, // <-- Ajout pour charger les variantes
      },
    });

    if (!product) {
      return null;
    }

    return transformProduct(product);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

// Fonction pour récupérer les produits similaires
async function getSimilarProducts(productId: string, categoryId: string, price: number) {
  try {
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId,
        isActive: true,
        status: "PUBLISHED",
        price: {
          gte: price * 0.7, // Prix entre 70% et 130% du prix original
          lte: price * 1.3,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    return similarProducts.map(transformProduct);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits similaires:", error);
    return [];
  }
}

// Page de détail produit
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Récupération des produits similaires
  const similarProducts = await getSimilarProducts(
    product.id,
    product.category.id,
    product.price
  );

  // Récupération du numéro WhatsApp de commande depuis WhatsappConfig
  const whatsappConfig = await prisma.whatsappConfig.findFirst({
    where: { isActive: true, type: 'order' },
    orderBy: { createdAt: 'desc' },
  });
  const whatsappNumber = whatsappConfig?.number || "22300000000";

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ton_id_imagekit";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sticky façon Jumia mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <ProductBreadcrumbs 
          categoryName={product.category.name}
          categorySlug={product.category.slug}
          productName={product.name}
        />

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-6">
          {/* Images du produit */}
          <div className="lg:sticky lg:top-8">
            <ImageKitProvider urlEndpoint={urlEndpoint}>
              <ProductDetailImages product={{
                ...product,
                comparePrice: product.comparePrice ?? null,
              }} />
            </ImageKitProvider>
          </div>

          {/* Informations du produit */}
          <div>
            <ProductDetailClient 
              product={product} 
              whatsappNumber={whatsappNumber}
            />
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <SimilarProducts 
              products={similarProducts.map(p => ({
                ...p,
                comparePrice: p.comparePrice ?? undefined,
                imageUrl: p.imageUrl ?? undefined,
              }))}
              currentProductId={product.id}
            />
          </div>
        )}
      </div>
    </div>
  );
} 