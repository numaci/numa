"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderStatus } from "@/types/admin";

const OrderFilters: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [minAmount, setMinAmount] = useState(searchParams.get("minAmount") || "");
  const [maxAmount, setMaxAmount] = useState(searchParams.get("maxAmount") || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);
    
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    router.push("/admin/orders");
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Recherche
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Numéro, client..."
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="PROCESSING">En traitement</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELLED">Annulée</option>
            <option value="REFUNDED">Remboursée</option>
          </select>
        </div>

        {/* Date de début */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          />
        </div>

        {/* Date de fin */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          />
        </div>

        {/* Montant minimum */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Montant min (FCFA)
          </label>
          <input
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
          />
        </div>

        {/* Montant maximum */}
        <div>
          <label className="block text-sm font-bold text-orange-800 mb-1">
            Montant max (FCFA)
          </label>
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="100000"
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-bold text-orange-700 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleFilter}
          className="px-4 py-2 text-sm font-bold text-white bg-orange-500 border border-orange-300 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Filtrer
        </button>
      </div>
    </div>
  );
};

export default OrderFilters; 