import { prisma } from "@/lib/prisma";
import ProductsLayout from "@/components/shop/ProductsLayout";
import ProductsCarousel from "@/components/shop/ProductsCarousel";
import TopCategories from "@/components/shop/TopCategories";
import Image from "next/image";
import AdBanner from "@/components/shop/AdBanner";
import { FaWhatsapp } from "react-icons/fa";
import ProductGrid from "@/components/shop/ProductGrid";
import CustomHorizontalScroll from "@/components/shop/CustomHorizontalScroll";
import AdBannerCarousel from "@/components/shop/AdBannerCarousel";

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
function transformProduct(product: Record<string, unknown>) {
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    supplierPrice: product.supplierPrice ? Number(product.supplierPrice) : null,
    shippingPrice: product.shippingPrice ? Number(product.shippingPrice) : null,
    variants: Array.isArray(product.variants)
      ? (product.variants as Array<any>).map((v: any) => ({ ...v, price: v.price ? Number(v.price) : 0 }))
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
  const where: any = {
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
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Tri
  let orderBy: any = { createdAt: "desc" };
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
    const products = rawProducts.map(transformProduct);

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      products,
      totalProducts,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    // console.error("Erreur lors de la récupération des produits:", error);
    throw new Error("Impossible de récupérer les produits");
  }
}

// Page catalogue des produits
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Récupération des pubs actives, triées par ordre
  const ads = await prisma.ad.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      buttonText: true,
      imageUrl: true,
      link: true,
      bgColor: true,
      productId: true,
      product: { select: { slug: true } },
      categoryId: true,
      category: { select: { slug: true } },
    },
  });

  // Ajoute les slugs pour le carousel
  const adsWithSlugs = ads.map(ad => ({
    ...ad,
    productSlug: ad.product?.slug || undefined,
    categorySlug: ad.category?.slug || undefined,
    imageUrl: ad.imageUrl || "",
    link: ad.link ?? undefined, // Corrige le typage : null => undefined
    bgColor: ad.bgColor ?? undefined, // Corrige le typage : null => undefined
    productId: ad.productId ?? undefined, // Corrige le typage : null => undefined
    categoryId: ad.categoryId ?? undefined, // Corrige le typage : null => undefined
  }));

  // Filtrer les pubs avec image
  const adsWithImage = adsWithSlugs.filter(ad => ad.imageUrl && ad.imageUrl !== "");
  // Slide par défaut si aucune pub avec image
  const defaultAd = [{
    id: "default",
    imageUrl: "", // toujours string
    title: "Bienvenue sur Sikasso Sugu",
    description: "Profitez de nos offres et d’un service client à votre écoute.",
    bgColor: "linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)", // string, jamais null
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
      <AdBannerCarousel ads={adsWithImage.length > 0 ? adsWithImage : defaultAd} />
      <main>
        {/* Grille des catégories publiques façon Jumia */}
        {publicCategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-2 py-4 grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-4">
            {/* Carte spéciale WhatsApp */}
            {/* Remplacement par le composant centralisé */}
            <a
              href={`https://wa.me/${whatsappNumber.replace('+','')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 rounded-xl flex flex-col items-stretch p-0 shadow overflow-hidden group cursor-pointer"
            >
              <div className="relative w-full aspect-square flex items-center justify-center">
                <FaWhatsapp size={48} className="text-white animate-bounce" />
              </div>
              <div className="w-full bg-white py-1 px-0.5 text-center">
                <span className="text-green-700 font-bold text-[10px] truncate block w-full">Commande sur WhatsApp</span>
              </div>
            </a>
            {publicCategories.map(cat => (
              <a
                key={cat.id}
                href={`/products/category/${cat.slug}`}
                className="bg-white rounded-xl flex flex-col items-stretch p-0 shadow overflow-hidden group cursor-pointer hover:shadow-lg transition"
              >
                <div className="relative w-full aspect-square">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover rounded-xl group-hover:scale-105 transition" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-orange-100 flex items-center justify-center text-xs text-orange-400 rounded-xl">Aucune</div>
                  )}
                </div>
                <div className="w-full bg-white py-1 px-0.5 text-center">
                  <span className="text-gray-900 font-semibold text-[10px] truncate block w-full">{cat.name}</span>
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
              <section key={section.id} className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 my-8 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
                <div className="flex flex-row items-center justify-between mb-4 gap-2 w-full">
                  <h2 className="flex-1 text-2xl sm:text-3xl font-extrabold text-amber-600 mb-1 text-left">{section.title}</h2>
                  <a href={`/home-section/${section.id}`} className="inline-block text-amber-700 text-sm font-bold px-5 py-2 rounded-full border-2 border-amber-200 bg-amber-100 hover:bg-amber-200 shadow transition">Voir plus</a>
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
          const topSellingProducts = topSellingProductsRaw.filter(Boolean);
          return topSellingProducts.length > 0 ? (
            <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 my-8 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
              <div className="flex items-center justify-start mb-4 gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mb-1 text-left">Les produits les plus vendus</h2>
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
            <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 my-8 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
              <div className="flex items-center justify-start mb-4 gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mb-1 text-left">Produits de santé</h2>
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