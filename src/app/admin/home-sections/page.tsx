import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomeSectionsAdminPage() {
  // Récupérer toutes les sections d'accueil avec leurs produits
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        include: {
          product: true
        },
        orderBy: { order: "asc" }
      }
    }
  });

  async function deleteSection(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.homeSection.delete({ where: { id } });
    redirect("/admin/home-sections");
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des sections d'accueil</h1>
      <Link href="/admin/home-sections/new" className="mb-4 inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">+ Nouvelle section</Link>
      <div className="space-y-8 mt-6">
        {sections.map(section => (
          <div key={section.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-lg">{section.title}</span>
                <span className="ml-2 text-xs text-gray-500">(Ordre: {section.order})</span>
                {!section.isActive && <span className="ml-2 text-xs text-red-500">(désactivée)</span>}
              </div>
              <div className="flex gap-4 items-center">
                <Link href={`/admin/home-sections/${section.id}/edit`} className="text-amber-700 hover:underline">Modifier</Link>
                <form action={deleteSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <button type="submit" className="text-red-600 hover:underline ml-2">Supprimer</button>
                </form>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {section.products.map(sp => (
                <span key={sp.id} className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                  {sp.product?.name || "Produit inconnu"}
                </span>
              ))}
              {section.products.length === 0 && <span className="text-gray-400 text-xs">Aucun produit associé</span>}
            </div>
          </div>
        ))}
        {sections.length === 0 && <div className="text-gray-500">Aucune section configurée.</div>}
      </div>
    </div>
  );
} 