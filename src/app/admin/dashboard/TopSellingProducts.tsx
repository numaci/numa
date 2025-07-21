import React from "react";
import { formatCurrency } from "@/lib/utils";
import { FiTrendingUp } from "react-icons/fi";

interface TopSellingProductsProps {
  topSellingProducts: Array<Record<string, unknown>>;
}

const totalAmount = (p: any) => Number(p.price) * p._sum.quantity;

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ topSellingProducts }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white rounded-t-2xl">
        <FiTrendingUp className="text-orange-500" size={22} />
        <h3 className="text-lg font-bold text-orange-700">Produits les plus vendus</h3>
      </div>
      <div className="overflow-visible">
        <table className="min-w-full divide-y divide-orange-100">
          <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider">Quantité vendue</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider">Prix unitaire</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 divide-y divide-orange-50">
            {topSellingProducts.map((product) => (
              <tr key={product.id} className="hover:bg-orange-50/60 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-xl object-cover shadow border border-orange-100"
                        src={product.imageUrl || "/placeholder-product.png"}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-orange-800">{product.name}</div>
                      <div className="text-xs text-orange-400">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                  {product._sum.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-orange-700 font-semibold">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-900">
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