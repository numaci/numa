import { prisma } from "@/lib/prisma";
import ProductBreadcrumbs from "@/components/shop/ProductBreadcrumbs";
import { notFound } from "next/navigation";
import CategoryProductList from "./CategoryProductList";
import CustomHorizontalScroll from "@/components/shop/CustomHorizontalScroll";
import ProductGrid from "@/components/shop/ProductGrid";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }, searchParams: any }) {
  // Récupérer la catégorie par slug
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      isActive: true,
    },
  });
  if (!category || !category.isActive) {
    notFound();
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Accueil", href: "/" },
    { label: "Produits", href: "/products" },
    { label: category.name, href: `/products/category/${category.slug}` },
  ];

  // Récupérer les sections personnalisées de la catégorie
  const homeSections = await prisma.homeSection.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { order: "asc" },
    include: {
      products: {
        include: { product: { include: { category: { select: { name: true, slug: true } } } } },
        orderBy: { order: "asc" }
      }
    }
  });
  function transformProduct(product: any) {
    return {
      ...product,
      price: product.price ? Number(product.price) : 0,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    };
  }

  const params_search = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumbs product={{ name: category.name, category: { name: category.name, slug: category.slug } }} />
      
      {/* En-tête de la catégorie avec image */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Image de la catégorie */}
          {category.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-lg object-cover shadow-lg"
              />
            </div>
          )}
          
          {/* Informations de la catégorie */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{category.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Sections personnalisées de la catégorie */}
      {homeSections.map(section => {
        const products = section.products.map(sp => sp.product).filter(Boolean).map(transformProduct);
        if (products.length === 0) return null;
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 my-8 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
            <div className="flex flex-row items-center justify-between mb-4 gap-2 w-full">
              <h2 className="flex-1 text-2xl sm:text-3xl font-extrabold text-amber-600 mb-1 text-left">{section.title}</h2>
            </div>
            <CustomHorizontalScroll>
              <ProductGrid products={products.slice(0, 10)} hideCartActions={true} smallCard={true} horizontalOnMobile={true} />
            </CustomHorizontalScroll>
          </section>
        );
      })}

      <CategoryProductList
        categoryId={category.id}
        searchParams={params_search}
        category={category}
      />
    </div>
  );
} 