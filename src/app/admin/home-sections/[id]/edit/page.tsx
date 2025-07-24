import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export default async function EditHomeSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await prisma.homeSection.findUnique({
    where: { id },
    include: {
      products: { include: { product: true }, orderBy: { order: "asc" } }
    }
  });
  if (!section) notFound();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  // Gestion du submit (POST)
  async function updateSection(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const order = Number(formData.get("order")) || 0;
    const isActive = formData.get("isActive") === "on";
    const selectedProducts = formData.getAll("products") as string[];

    // Mettre à jour la section et ses produits (remplacement complet)
    await prisma.homeSection.update({
      where: { id },
      data: {
        title,
        order,
        isActive,
        products: {
          deleteMany: {},
          create: selectedProducts.map((productId, idx) => ({
            product: { connect: { id: productId } },
            order: idx
          }))
        }
      }
    });
    redirect("/admin/home-sections");
  }

  const selectedProductIds = section.products.map(sp => sp.productId);

  return (
    <form action={updateSection} className="max-w-xl mx-auto py-8 px-4 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Modifier la section d'accueil</h1>
      <div>
        <label className="block font-medium mb-1">Titre de la section</label>
        <input name="title" required className="w-full border rounded px-3 py-2" defaultValue={section.title} />
      </div>
      <div>
        <label className="block font-medium mb-1">Ordre d'affichage</label>
        <input name="order" type="number" defaultValue={section.order} className="w-24 border rounded px-3 py-2" />
      </div>
      <div className="flex items-center gap-2">
        <input name="isActive" type="checkbox" defaultChecked={section.isActive} id="isActive" />
        <label htmlFor="isActive">Section active</label>
      </div>
      <div>
        <label className="block font-medium mb-1">Produits à afficher</label>
        <select name="products" multiple className="w-full border rounded px-3 py-2 h-40">
          {products.map(p => (
            <option key={p.id} value={p.id} selected={selectedProductIds.includes(p.id)}>{p.name}</option>
          ))}
        </select>
        <div className="text-xs text-gray-500 mt-1">Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs produits</div>
      </div>
      <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700">Enregistrer</button>
    </form>
  );
} 