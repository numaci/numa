import React from "react";
import Link from "next/link";

const PageHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-orange-800">Gestion des commandes</h1>
        <p className="mt-1 text-sm text-orange-400">
          Consultez et gérez toutes les commandes de votre boutique
        </p>
      </div>
      <div className="flex space-x-3">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 text-sm font-bold text-white bg-orange-500 border border-orange-300 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
};

export default PageHeader; 