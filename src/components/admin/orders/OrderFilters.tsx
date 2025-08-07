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

  const hasActiveFilters = search || (status && status !== "all") || startDate || endDate || minAmount || maxAmount;

  return (
    <div className="admin-card mb-6">
      {/* Header section */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 antialiased">
          🔍 Rechercher et filtrer les commandes
        </h3>
        <p className="text-sm text-gray-600 mt-1 antialiased">
          Utilisez les filtres ci-dessous pour trouver rapidement les commandes de votre boutique
        </p>
        {hasActiveFilters && (
          <div className="mt-2 text-sm text-blue-600 antialiased">
            📊 Filtres actifs appliqués
          </div>
        )}
      </div>

      {/* Filters grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              🔍 Recherche
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="N° commande, nom client..."
              className="admin-input"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              📋 Statut de la commande
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="admin-input"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">⏳ En attente</option>
              <option value="PROCESSING">🔄 En préparation</option>
              <option value="SHIPPED">📦 Expédiée</option>
              <option value="DELIVERED">✅ Livrée</option>
              <option value="CANCELLED">❌ Annulée</option>
              <option value="REFUNDED">💰 Remboursée</option>
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              📅 Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-input"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              📅 Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-input"
            />
          </div>

          {/* Montant minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              💰 Montant min (FCFA)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Ex: 5000"
              className="admin-input"
            />
          </div>

          {/* Montant maximum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              💰 Montant max (FCFA)
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Ex: 100000"
              className="admin-input"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 antialiased">
            {hasActiveFilters ? (
              <span>✨ Des filtres sont appliqués à votre recherche</span>
            ) : (
              <span>Aucun filtre appliqué</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="admin-button-secondary"
            >
              🔄 Réinitialiser
            </button>
            <button
              onClick={handleFilter}
              className="admin-button-primary"
            >
              🔍 Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;