"use client";
import { useState } from "react";
import Link from "next/link";
import ResetRequestCardClient from "./ResetRequestCardClient";

export default function ResetRequestsClient({ initialRequests }) {
  const [reqs, setReqs] = useState(initialRequests);
  const handleRemove = (id) => setReqs((prev) => prev.filter((r) => r.id !== id));
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-amber-700">Demandes de réinitialisation de mot de passe</h1>
      {reqs.length === 0 ? (
        <div className="text-gray-500">Aucune demande en attente.</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-4 divide-y divide-amber-50">
          {reqs.map((req) => (
            <ResetRequestCardClient key={req.id} req={req} onRemove={handleRemove} />
          ))}
        </div>
      )}
      <div className="mt-8">
        <Link href="/admin/users" className="text-amber-600 underline">Retour à la gestion des utilisateurs</Link>
      </div>
    </div>
  );
} 