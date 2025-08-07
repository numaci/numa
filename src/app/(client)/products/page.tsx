import { prisma } from "@/lib/prisma";
import ProductsLayout from "@/components/shop/ProductsLayout";
import { FaWhatsapp } from "react-icons/fa";
import ProductGrid from "@/components/shop/ProductGrid";
import CustomHorizontalScroll from "@/components/shop/CustomHorizontalScroll";
import AdBannerCarousel from "@/components/shop/AdBannerCarousel";
import Image from "next/image";
// Définition locale du type Product pour correspondre aux objets transformés
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  supplierPrice?: number;
  shippingPrice?: number;
  stock: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  imageUrl?: string;
  images?: string;
  isActive: boolean;
  isFeatured: boolean;
  isBest?: boolean;
  isHealth?: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  refuseComment?: string | null;
  variants: Array<{ id: string; name: string; value: string; price: number }>;
};

// Interface pour les paramètres de recherche
interface SearchParams {
  page?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
}

// Fonction pour convertir les objets Decimal en nombres
function transformProduct(product: unknown): Product {
  const p = product as any;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: typeof p.price === 'number' ? p.price : Number(p.price),
    comparePrice: p.comparePrice !== undefined && p.comparePrice !== null ? Number(p.comparePrice) : undefined,
    supplierPrice: p.supplierPrice !== undefined && p.supplierPrice !== null ? Number(p.supplierPrice) : undefined,
    shippingPrice: p.shippingPrice !== undefined && p.shippingPrice !== null ? Number(p.shippingPrice) : undefined,
    stock: p.stock,
    sku: p.sku,
    weight: p.weight,
    dimensions: p.dimensions,
    imageUrl: p.imageUrl !== null && p.imageUrl !== undefined ? p.imageUrl : undefined,
    images: p.images !== null && p.images !== undefined ? p.images : undefined,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBest: p.isBest,
    isHealth: p.isHealth,
    categoryId: p.categoryId,
    createdAt: new Date(p.createdAt).toISOString(),
    updatedAt: new Date(p.updatedAt).toISOString(),
    status: p.status,
    refuseComment: p.refuseComment,
    variants: Array.isArray(p.variants)
      ? p.variants.map((v: any) => ({
          ...v,
          price: typeof v.price === 'number' ? v.price : Number(v.price),
        }))
      : [],
  };
}

// Fonction pour récupérer les produits avec filtres
async function getProducts(searchParams: Promise<SearchParams>) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 12; // Produits par page
  const skip = (page - 1) * limit;

  // Construction des filtres
  const where: Record<string, any> = {
    isActive: true, // Seulement les produits actifs
  };

  // Filtre par catégorie
  if (params.category) {
    where.category = {
      slug: params.category,
      isActive: true,
    };
  }

  // Filtre par prix
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) {
      where.price.gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      where.price.lte = parseFloat(params.maxPrice);
    }
  }

  // Filtre par recherche
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  // Tri
  let orderBy: Record<string, any> = { createdAt: "desc" };
  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }
  }

  try {
    // Récupération des produits avec pagination
    const [rawProducts, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          variants: true, // Ajouté pour la compatibilité variantes
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Conversion des objets Decimal en nombres et sécurisation de variants
    const products = rawProducts.map(p => {
  const prod = transformProduct(p);
  // Ensure imageUrl is a full URL or add base URL if needed
  if (prod.imageUrl && !prod.imageUrl.startsWith('http')) {
    prod.imageUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}${prod.imageUrl}` : prod.imageUrl;
  }
  return prod;
});

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      products,
      totalProducts,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération des produits:", error);
    throw new Error("Impossible de récupérer les produits");
  }
}

// Page catalogue des produits
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Récupération des pubs actives, triées par date
  const ads = await prisma.ad.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // Filtrer les pubs avec une image valide
  const adsWithImage = ads.filter(ad => ad.imageUrl && ad.imageUrl !== "");
  // Slide par défaut si aucune pub avec image
  const defaultAd = [{
    id: "default",
    imageUrl: "", // toujours string
    title: "Bienvenue sur Sikasso Sugu",
    description: "Profitez de nos offres et d'un service client à votre écoute.",
    bgColor: "linear-gradient(90deg, #f5f5f5 0%, #e5e5e5 100%)", // Fond gris clair
    link: undefined, // Corrige le typage : pas de null
    productId: undefined, // Corrige le typage : jamais null
    categoryId: undefined, // Corrige le typage : jamais null
  }];

  // Récupération des top catégories (avec le nombre de produits)
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      description: true,
      isPublic: true, // Added isPublic to select
      _count: {
        select: {
          products: {
            where: { isActive: true }
          }
        }
      }
    },
    take: 8, // Prendre plus pour avoir un choix
  });

  // Trier par nombre de produits décroissant
  categories.sort((a, b) => b._count.products - a._count.products);

  // Récupération des catégories publiques (isPublic)
  const publicCategories = categories.filter(cat => cat.isPublic);

  // Récupération du numéro WhatsApp depuis la config (table whatsappConfig)
  const whatsappConfig = await prisma.whatsappConfig.findFirst({
    where: { isActive: true, type: "order" },
    orderBy: { createdAt: "desc" },
  });
  let whatsappNumber = whatsappConfig?.number?.replace(/\D/g, "") || "22300000000";
  if (whatsappNumber.length <= 9 && !whatsappNumber.startsWith("223")) {
    whatsappNumber = `223${whatsappNumber}`;
  }
  whatsappNumber = `+${whatsappNumber}`;

  const { products, totalProducts, totalPages, currentPage } = 
    await getProducts(searchParams);

  return (
    <div className="animate-fade-in">
      {/* Carousel publicitaire toujours visible */}
      <AdBannerCarousel ads={adsWithImage.length > 0 ? adsWithImage : defaultAd.map(ad => ({...ad, imageUrl: ad.imageUrl!}))} />
      <main>
        {/* Grille des catégories publiques */}
        {publicCategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
            {/* Carte WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber.replace('+','')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-green-100 flex flex-col items-stretch p-0 overflow-hidden group cursor-pointer hover:border-green-300 transition-all duration-300"
            >
              <div className="relative w-full aspect-square flex items-center justify-center bg-green-50">
                <FaWhatsapp size={36} className="text-green-500" />
              </div>
              <div className="w-full bg-white py-2 px-1 text-center">
                <span className="text-green-700 font-medium text-[10px] truncate block w-full">Commande WhatsApp</span>
              </div>
            </a>
            {publicCategories.map(cat => (
              <a
                key={cat.id}
                href={`/products/category/${cat.slug}`}
                className="bg-white border border-gray-100 flex flex-col items-stretch p-0 overflow-hidden group cursor-pointer hover:border-gray-300 transition-all duration-300"
              >
                <div className="relative w-full aspect-square">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl || '/images/placeholder.jpg'} 
                      alt={cat.name}
                      fill
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={false}
                      loading="lazy"
                      quality={75}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-50 flex items-center justify-center text-xs text-gray-400">Aucune</div>
                  )}
                </div>
                <div className="w-full bg-white py-2 px-1 text-center">
                  <span className="text-black font-medium text-[10px] truncate block w-full">{cat.name}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Sections d'accueil dynamiques (HomeSection) */}
        {await (async () => {
          const homeSections = await prisma.homeSection.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              products: {
                include: { product: { include: { category: { select: { name: true, slug: true } } } } },
                orderBy: { order: "asc" }
              }
            }
          });
          return homeSections.map(section => {
            const products = section.products.map(sp => sp.product).filter(Boolean).map(transformProduct);
            if (products.length === 0) return null;
            const showVoirPlus = products.length > 10;
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 py-10 my-6 bg-white border-t border-b border-gray-100">
                <div className="flex flex-row items-center justify-between mb-6 gap-2 w-full">
                  <h2 className="flex-1 text-xl font-medium text-black mb-0 text-left tracking-tight">{section.title}</h2>
                  <a href={`/home-section/${section.id}`} className="inline-block text-black text-sm font-medium px-4 py-1.5 border border-gray-200 hover:bg-gray-50 transition-all duration-300">
                    Voir plus
                  </a>
                </div>
                <CustomHorizontalScroll>
                  <ProductGrid products={products.slice(0, 10)} hideCartActions={true} smallCard={true} horizontalOnMobile={true} />
                </CustomHorizontalScroll>
              </section>
            );
          });
        })()}
        {/* Section Les produits les plus vendus */}
        {await (async () => {
          // Récupérer les 10 produits les plus vendus
          const topSelling = await prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
              productId: { 
                not: null 
              },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 10,
          });
          // Récupérer les infos produits
          const topSellingProductsRaw = await Promise.all(
            topSelling.map(async (item) => {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { category: { select: { name: true, slug: true } } },
              });
              return product ? transformProduct(product) : null;
            })
          );
          const topSellingProducts = topSellingProductsRaw.filter(Boolean).map(transformProduct);
          return topSellingProducts.length > 0 ? (
            <section className="max-w-7xl mx-auto px-4 py-10 my-6 bg-white border-t border-b border-gray-100">
              <div className="flex items-center justify-start mb-6 gap-2">
                <h2 className="text-xl font-medium text-black mb-0 text-left tracking-tight">Les produits les plus vendus</h2>
              </div>
              <CustomHorizontalScroll>
                <ProductGrid products={topSellingProducts} hideCartActions={true} smallCard={true} horizontalOnMobile={true} />
              </CustomHorizontalScroll>
            </section>
          ) : null;
        })()}
        {/* Section Produits de santé */}
        {await (async () => {
          const healthProducts = await prisma.product.findMany({
            where: { isActive: true, isHealth: true },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { category: { select: { name: true, slug: true } } },
          });
          const healthProductsTransformed = healthProducts.map(transformProduct);
          return healthProductsTransformed.length > 0 ? (
            <section className="max-w-7xl mx-auto px-4 py-10 my-6 bg-white border-t border-b border-gray-100">
              <div className="flex items-center justify-start mb-6 gap-2">
                <h2 className="text-xl font-medium text-black mb-0 text-left tracking-tight">Produits de santé</h2>
              </div>
              <CustomHorizontalScroll>
                <ProductGrid products={healthProductsTransformed} hideCartActions={true} smallCard={true} horizontalOnMobile={true} />
              </CustomHorizontalScroll>
            </section>
          ) : null;
        })()}
        <ProductsLayout
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}