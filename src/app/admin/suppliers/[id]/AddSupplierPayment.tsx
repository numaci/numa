'use client';
import { useState } from "react";

export default function AddSupplierPayment({ supplierId }: { supplierId: string }) {
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, status }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement du paiement");
      setSuccess(true);
      setAmount(0);
      setStatus("pending");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <div>
        <label className="block text-sm">Montant (XOF)</label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="input input-bordered w-full" required min={1} />
      </div>
      <div>
        <label className="block text-sm">Statut</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input input-bordered w-full">
          <option value="pending">En attente</option>
          <option value="paid">Payé</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer le paiement</button>
      {success && <div className="text-green-600">Paiement enregistré !</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
} 