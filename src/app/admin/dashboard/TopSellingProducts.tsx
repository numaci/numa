import React from "react";
import { formatCurrency } from "@/lib/utils";
import { FiTrendingUp } from "react-icons/fi";

interface TopSellingProductsProps {
  topSellingProducts: Array<Record<string, unknown>>;
}

const totalAmount = (p: any) => Number(p.price) * p._sum.quantity;

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ topSellingProducts }) => {
  return (
    <div className="admin-table">
      <div className="admin-table-header">
        <FiTrendingUp className="text-gray-700" size={22} />
        <h3 className="text-lg font-semibold text-black tracking-tight antialiased">Produits les plus vendus</h3>
      </div>
      <div className="overflow-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="admin-table-th">Produit</th>
              <th className="admin-table-th">Quantité vendue</th>
              <th className="admin-table-th">Prix unitaire</th>
              <th className="admin-table-th">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topSellingProducts.map((product) => (
              <tr key={product.id} className="admin-table-row">
                <td className="admin-table-td">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-xl object-cover shadow-sm border border-gray-200"
                        src={product.imageUrl || "/placeholder-product.png"}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-black antialiased">{product.name}</div>
                      <div className="text-xs text-gray-500 antialiased">ID: {product.id?.toString().slice(-6) || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="admin-table-td text-sm text-black font-semibold antialiased">
                  {product._sum?.quantity || 0}
                </td>
                <td className="admin-table-td text-black font-semibold antialiased">
                  {formatCurrency(product.price || 0)}
                </td>
                <td className="admin-table-td text-sm font-semibold text-black antialiased">
                  {formatCurrency(totalAmount(product))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellingProducts;