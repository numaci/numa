"use client";

import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";

export default function CartCounter() {
  const { data: session, status } = useSession();
  const { items, isLoading, error, isAuthenticated, getTotalCount } = useCart();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-lg mb-2">Debug Cart Counter</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> {status}
        </div>
        
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </div>
        
        <div>
          <strong>User ID:</strong> {session?.user?.id || "None"}
        </div>
        
        <div>
          <strong>Items count:</strong> {items.length}
        </div>
        
        <div>
          <strong>Total quantity:</strong> {getTotalCount()}
        </div>
        
        <div>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="mt-3">
          <strong>Items:</strong>
          <ul className="mt-1 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-xs">
                {item.name} - Qty: {item.quantity} - €{item.price}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 