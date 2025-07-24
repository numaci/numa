import Link from "next/link";
import AddSupplierPayment from "./AddSupplierPayment";
import { headers } from "next/headers";

async function getSupplier(id: string) {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/admin/suppliers/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function getProducts(id: string) {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/admin/suppliers/${id}/products`, { cache: "no-store" });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}
async function getSales(id: string) {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/admin/suppliers/${id}/sales`, { cache: "no-store" });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}
async function getPayments(id: string) {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/admin/suppliers/${id}/payments`, { cache: "no-store" });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supplier, products, sales, payments] = await Promise.all([
    getSupplier(id),
    getProducts(id),
    getSales(id),
    getPayments(id),
  ]);

  if (!supplier) {
    return <div className="text-red-600">Fournisseur introuvable ou erreur de chargement.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 mt-10">
      <div className="flex items-center mb-6 gap-2">
        <Link href="/admin/suppliers" className="text-orange-600 hover:underline font-semibold">&larr; Retour</Link>
        <h1 className="text-2xl font-bold text-orange-700 ml-2">Fournisseur : {supplier.name}</h1>
        <Link href={`/admin/suppliers/${supplier.id}/edit`} className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:scale-105 transition">Modifier</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="font-semibold text-orange-700 mb-2">Informations</h2>
          <ul className="space-y-1 text-orange-900">
            <li><span className="font-bold">Email :</span> {supplier.email}</li>
            <li><span className="font-bold">Téléphone :</span> {supplier.phone}</li>
            <li><span className="font-bold">Adresse :</span> {supplier.address}</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-orange-700 mb-2">Paiements</h2>
          <ul className="space-y-1 text-orange-900">
            {payments.map((p: any) => (
              <li key={p.id}>
                {p.amount} XOF - {p.status} {p.paidAt ? `(Payé le ${new Date(p.paidAt).toLocaleDateString()})` : ''}
              </li>
            ))}
          </ul>
          <AddSupplierPayment supplierId={supplier.id} />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold text-orange-700 mb-2">Produits publiés</h2>
        <ul className="list-disc ml-6 text-orange-900">
          {products.map((prod: any) => (
            <li key={prod.id}>{prod.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold text-orange-700 mb-2">Historique des ventes</h2>
        <ul className="list-disc ml-6 text-orange-900">
          {sales.map((sale: any) => (
            <li key={sale.id}>
              {sale.quantity} x {sale.product.name} — Commande {sale.order.orderNumber} — {sale.price} XOF
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 