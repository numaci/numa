import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
import ProductGrid from "@/components/shop/ProductGrid";

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
}

interface Section {
  id: string;
  title: string;
  products: Product[];
}

interface CategorySectionsManagerProps {
  categoryId: string;
}

export default function CategorySectionsManager({ categoryId }: CategorySectionsManagerProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [addProductSectionId, setAddProductSectionId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Charger les sections de la catégorie
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/categories/${categoryId}/sections`)
      .then(res => res.json())
      .then(data => setSections(data.sections))
      .catch(() => setError("Erreur lors du chargement des sections"))
      .finally(() => setLoading(false));
  }, [categoryId]);

  // Charger tous les produits de la catégorie
  useEffect(() => {
    fetch(`/api/admin/categories/${categoryId}/products`)
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []));
  }, [categoryId]);

  // Ajouter une section
  const handleAddSection = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${categoryId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    });
    if (res.ok) {
      const data = await res.json();
      setSections([...sections, data.section]);
      setNewTitle("");
    } else {
      setError("Erreur lors de l'ajout de la section");
    }
    setLoading(false);
  };

  // Supprimer une section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Supprimer cette section ?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${categoryId}/sections/${sectionId}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setSections(sections.filter(s => s.id !== sectionId));
    } else {
      setError("Erreur lors de la suppression");
    }
    setLoading(false);
  };

  // Ajouter un produit à une section
  const handleAddProduct = async (sectionId: string) => {
    if (!selectedProductId) return;
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${categoryId}/sections/${sectionId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProductId })
    });
    if (res.ok) {
      // Rafraîchir les sections
      const data = await fetch(`/api/admin/categories/${categoryId}/sections`).then(r => r.json());
      setSections(data.sections);
      setSelectedProductId("");
      setAddProductSectionId(null);
    } else {
      setError("Erreur lors de l'ajout du produit");
    }
    setLoading(false);
  };

  // Retirer un produit d'une section
  const handleRemoveProduct = async (sectionId: string, productId: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${categoryId}/sections/${sectionId}/products/${productId}`, {
      method: "DELETE"
    });
    if (res.ok) {
      // Rafraîchir les sections
      const data = await fetch(`/api/admin/categories/${categoryId}/sections`).then(r => r.json());
      setSections(data.sections);
    } else {
      setError("Erreur lors du retrait du produit");
    }
    setLoading(false);
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Sections personnalisées de la catégorie</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-2 mb-4">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Titre de la nouvelle section"
          disabled={loading}
          className="border rounded px-2 py-1 flex-1"
        />
        <Button onClick={handleAddSection} disabled={loading || !newTitle.trim()}>Ajouter</Button>
      </div>
      {loading && <div>Chargement…</div>}
      {sections.length === 0 && !loading && <div>Aucune section pour cette catégorie.</div>}
      <div className="space-y-6">
        {sections.map(section => {
          // Produits non encore dans la section
          const availableProducts = allProducts.filter(
            p => !section.products.some(sp => sp.id === p.id)
          );
          return (
            <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{section.title}</span>
                <Button variant="destructive" onClick={() => handleDeleteSection(section.id)} size="sm">Supprimer</Button>
              </div>
              {/* Affichage des produits de la section */}
              <div className="mb-2">
                {section.products.length === 0 && <div className="text-gray-400">Aucun produit dans cette section.</div>}
                <ul className="flex flex-wrap gap-2">
                  {section.products.map(product => (
                    <li key={product.id} className="flex items-center gap-2 border rounded px-2 py-1 bg-white">
                      <span>{product.name}</span>
                      <Button variant="outline" size="xs" onClick={() => handleRemoveProduct(section.id, product.id)}>Retirer</Button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Ajout de produit */}
              {addProductSectionId === section.id ? (
                <div className="flex gap-2 items-center mb-2">
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Sélectionner un produit…</option>
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => handleAddProduct(section.id)} disabled={!selectedProductId}>Ajouter</Button>
                  <Button size="sm" variant="outline" onClick={() => { setAddProductSectionId(null); setSelectedProductId(""); }}>Annuler</Button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setAddProductSectionId(section.id)}>Ajouter un produit</Button>
              )}
              {/* Affichage visuel */}
              <ProductGrid products={section.products} hideCartActions smallCard />
            </div>
          );
        })}
      </div>
    </div>
  );
} 