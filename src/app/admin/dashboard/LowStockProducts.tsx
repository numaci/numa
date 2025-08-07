import React from "react";
import { formatCurrency } from "@/lib/utils";
import { FiAlertTriangle } from "react-icons/fi";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface LowStockProductsProps {
  lowStockProducts: LowStockProduct[];
}

const LowStockProducts: React.FC<LowStockProductsProps> = ({ lowStockProducts }) => (
  <div className="admin-table">
    <div className="admin-table-header">
      <FiAlertTriangle className="text-gray-700" size={22} />
      <h3 className="text-lg font-semibold text-black tracking-tight antialiased">Stock faible</h3>
    </div>
    <div className="p-6">
      {lowStockProducts.length > 0 ? (
        <div className="space-y-4">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out hover:scale-[1.02]"
            >
              <div>
                <p className="font-semibold text-black antialiased">{product.name}</p>
                <p className="text-xs text-gray-500 antialiased">ID: {product.id.slice(-6)}</p>
              </div>
              <div className="text-right">
                <span className={`admin-status-badge mr-2 ${
                  product.stock === 0 ? "bg-red-600 text-white" :
                  product.stock < 5 ? "bg-orange-500 text-white" :
                  "bg-yellow-500 text-yellow-900"
                }`}>
                  {product.stock} en stock
                </span>
                <p className="text-sm text-gray-700 font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8 antialiased">
          Tous les produits ont un stock suffisant
        </p>
      )}
    </div>
  </div>
);

export default LowStockProducts;