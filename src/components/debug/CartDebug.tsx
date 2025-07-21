"use client";

import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function CartDebug() {
  const { data: session } = useSession();
  const { 
    items, 
    addToCart, 
    removeFromCart, 
    getTotalCount, 
    getTotalPrice, 
    isLoading, 
    error,
    isAuthenticated,
    loadCartFromDatabase 
  } = useCart();

  const handleAddTestProduct = () => {
    addToCart({
      productId: "test-product-1",
      name: "Produit de test",
      price: 29.99,
      imageUrl: "https://via.placeholder.com/150",
      stock: 10
    }, 1);
  };

  const handleAddAnotherProduct = () => {
    addToCart({
      productId: "test-product-2",
      name: "Autre produit",
      price: 19.99,
      imageUrl: "https://via.placeholder.com/150",
      stock: 5
    }, 2);
  };

  const handleRemoveTestProduct = () => {
    if (items.length > 0) {
      removeFromCart(items[0].productId);
    }
  };

  const handleRefreshCart = () => {
    loadCartFromDatabase();
  };

  // Calculer le compteur manuellement pour vérifier
  const manualCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-lg mb-2">Debug Panier</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> {session ? "Connecté" : "Non connecté"}
        </div>
        <div>
          <strong>Authentifié:</strong> {isAuthenticated ? "Oui" : "Non"}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? "Oui" : "Non"}
        </div>
        <div>
          <strong>Articles:</strong> {items.length}
        </div>
        <div>
          <strong>Total count (hook):</strong> {getTotalCount()}
        </div>
        <div>
          <strong>Total count (manuel):</strong> {manualCount}
        </div>
        <div>
          <strong>Total price:</strong> {getTotalPrice().toFixed(2)} €
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Erreur:</strong> {error}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Button 
          onClick={handleAddTestProduct}
          size="sm"
          className="w-full"
          disabled={isLoading}
        >
          Ajouter produit test
        </Button>
        
        <Button 
          onClick={handleAddAnotherProduct}
          size="sm"
          className="w-full"
          disabled={isLoading}
        >
          Ajouter autre produit
        </Button>
        
        <Button 
          onClick={handleRemoveTestProduct}
          size="sm"
          variant="outline"
          className="w-full"
          disabled={isLoading || items.length === 0}
        >
          Supprimer premier produit
        </Button>
        
        {isAuthenticated && (
          <Button 
            onClick={handleRefreshCart}
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Recharger panier
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Articles actuels:</h4>
          <div className="space-y-1 text-xs">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 