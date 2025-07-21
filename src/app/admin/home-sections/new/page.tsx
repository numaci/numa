import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductSelectorGrid from "./ProductSelectorGrid";

const PLACEHOLDER = "/placeholder.png";

export default async function NewHomeSectionPage() {
  // Récupérer tous les produits actifs pour la sélection, avec leur catégorie
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true, category: { select: { id: true, name: true } } }
  });
  // Extraire la liste des catégories distinctes
  const categories = Array.from(
    new Map(
      products
        .filter(p => p.category)
        .map(p => [p.category.id, { id: p.category.id, name: p.category.name }])
    ).values()
  );

  // Gestion du submit (POST)
  async function createSection(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const order = Number(formData.get("order")) || 0;
    const isActive = formData.get("isActive") === "on";
    const selectedProducts = formData.getAll("products") as string[];

    // Créer la section
    const section = await prisma.homeSection.create({
      data: {
        title,
        order,
        isActive,
        products: {
          create: selectedProducts.map((productId, idx) => ({
            productId,
            order: idx,
          })),
        },
      },
    });
    redirect("/admin/home-sections");
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Nouvelle section d'accueil</h1>
      <form action={createSection} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Titre de la section</label>
          <input name="title" required className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Ordre d'affichage</label>
          <input name="order" type="number" defaultValue={0} className="border rounded px-3 py-2 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked id="isActive" />
          <label htmlFor="isActive">Section active</label>
        </div>
        <div>
          <label className="block font-medium mb-2">Sélectionner les produits à afficher</label>
          {/* Grille de sélection avec filtre (composant client) */}
          <ProductSelectorGrid products={products} categories={categories} />
        </div>
        <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 font-semibold mt-4">Créer la section</button>
      </form>
    </div>
  );
} 