import React from "react";
import { formatCurrency } from "@/lib/utils";
import { FiAlertTriangle } from "react-icons/fi";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface LowStockProductsProps {
  lowStockProducts: LowStockProduct[];
}

const LowStockProducts: React.FC<LowStockProductsProps> = ({ lowStockProducts }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white rounded-t-2xl">
      <FiAlertTriangle className="text-orange-500" size={22} />
      <h3 className="text-lg font-bold text-orange-700">Stock faible</h3>
    </div>
    <div className="p-6">
      {lowStockProducts.length > 0 ? (
        <div className="space-y-4">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border border-orange-100 rounded-xl bg-white/70 shadow hover:bg-orange-50/60 transition"
            >
              <div>
                <p className="font-bold text-orange-900">{product.name}</p>
                <p className="text-xs text-orange-400">SKU: {product.sku || "N/A"}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full shadow-lg mr-2 ${
                  product.stock === 0 ? "bg-gradient-to-r from-red-400 to-red-600 text-white" :
                  product.stock < 5 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white" :
                  "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900"
                }`}>
                  {product.stock} en stock
                </span>
                <p className="text-sm text-orange-700 font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-orange-400 text-center py-4">
          Tous les produits ont un stock suffisant
        </p>
      )}
    </div>
  </div>
);

export default LowStockProducts; 