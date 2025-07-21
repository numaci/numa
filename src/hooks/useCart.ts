import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
}

export function useCart() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // État local du panier (pour les utilisateurs non connectés)
  const localItems = useCartStore((state) => state.items);
  const localAddToCart = useCartStore((state) => state.addToCart);
  const localRemoveFromCart = useCartStore((state) => state.removeFromCart);
  const localUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const localClearCart = useCartStore((state) => state.clearCart);

  // État du panier connecté
  const [connectedItems, setConnectedItems] = useState<CartItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState(0); // Pour forcer les re-rendus

  // Charger le panier depuis la base de données quand l'utilisateur se connecte
  useEffect(() => {
    // console.log("useCart: Status changed to", status);
    // console.log("useCart: Session user ID", session?.user?.id);
    
    if (status === "authenticated" && session?.user?.id) {
      // console.log("useCart: Loading cart from database for user", session.user.id);
      loadCartFromDatabase();
    } else if (status === "unauthenticated") {
      // console.log("useCart: User not authenticated, using local cart");
      setConnectedItems([]);
    }
  }, [status, session?.user?.id]);

  // Charger le panier depuis la base de données
  const loadCartFromDatabase = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setIsLoading(true);
    
    try {
      // console.log("useCart: Fetching cart from /api/cart");
      const response = await fetch("/api/cart");
      
      if (response.ok) {
        const data = await response.json();
        // console.log("useCart: Cart data received", data);
        setConnectedItems(data.items || []);
        setLastUpdate(Date.now()); // Force re-render
      } else {
        // console.error("useCart: Error loading cart", response.status, response.statusText);
        // setError("Impossible de charger le panier"); // Original code had this line commented out
      }
    } catch {
      // console.error("useCart: Error loading cart");
      // setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // Ajouter un produit au panier
  const addToCart = useCallback(async (item: Omit<CartItem, "quantity">, quantity: number) => {
    // console.log("useCart: Adding to cart", item, quantity);
    
    if (status === "authenticated") {
      // Utilisateur connecté - sauvegarder en base de données
      setIsLoading(true);
      
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: quantity,
          }),
        });

        if (response.ok) {
          // console.log("useCart: Product added successfully");
          // Recharger le panier depuis la base de données
          await loadCartFromDatabase();
        } else {
          // console.error("useCart: Error adding to cart", errorData);
          // setError(errorData.error || "Erreur lors de l'ajout au panier"); // Original code had this line commented out
        }
      } catch {
        // console.error("useCart: Error adding to cart");
        // setError("Erreur de connexion");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Utilisateur non connecté - utiliser le panier local
      // console.log("useCart: Adding to local cart");
      localAddToCart(item, quantity);
      // Forcer un re-render pour les utilisateurs non connectés
      setLastUpdate(Date.now());
    }
  }, [status, localAddToCart, loadCartFromDatabase]);

  // Supprimer un produit du panier
  const removeFromCart = useCallback(async (productId: string) => {
    // console.log("useCart: Removing from cart", productId);
    
    if (status === "authenticated") {
      // Utilisateur connecté - supprimer de la base de données
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // console.log("useCart: Product removed successfully");
          // Recharger le panier depuis la base de données
          await loadCartFromDatabase();
        } else {
          // console.error("useCart: Error removing from cart");
          // setError("Erreur lors de la suppression"); // Original code had this line commented out
        }
      } catch {
        // console.error("useCart: Error removing from cart");
        // setError("Erreur de connexion");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Utilisateur non connecté - utiliser le panier local
      // console.log("useCart: Removing from local cart");
      localRemoveFromCart(productId);
      // Forcer un re-render pour les utilisateurs non connectés
      setLastUpdate(Date.now());
    }
  }, [status, localRemoveFromCart, loadCartFromDatabase]);

  // Mettre à jour la quantité d'un produit
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    // console.log("useCart: Updating quantity", productId, quantity);
    
    if (status === "authenticated") {
      // Utilisateur connecté - mettre à jour en base de données
      setIsLoading(true);
      
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            quantity: quantity,
          }),
        });

        if (response.ok) {
          // console.log("useCart: Quantity updated successfully");
          // Recharger le panier depuis la base de données
          await loadCartFromDatabase();
        } else {
          // console.error("useCart: Error updating quantity", errorData);
          // setError(errorData.error || "Erreur lors de la mise à jour"); // Original code had this line commented out
        }
      } catch {
        // console.error("useCart: Error updating quantity");
        // setError("Erreur de connexion");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Utilisateur non connecté - utiliser le panier local
      // console.log("useCart: Updating local cart quantity");
      localUpdateQuantity(productId, quantity);
      // Forcer un re-render pour les utilisateurs non connectés
      setLastUpdate(Date.now());
    }
  }, [status, localUpdateQuantity, loadCartFromDatabase]);

  // Vider le panier
  const clearCart = useCallback(() => {
    if (status === "authenticated") {
      // Pour l'instant, on supprime chaque article individuellement
      // TODO: Ajouter une route API pour vider tout le panier
      connectedItems.forEach(item => {
        removeFromCart(item.productId);
      });
    } else {
      // Utilisateur non connecté - utiliser le panier local
      localClearCart();
      // Forcer un re-render pour les utilisateurs non connectés
      setLastUpdate(Date.now());
    }
  }, [status, connectedItems, removeFromCart, localClearCart]);

  // Calculs optimisés avec useMemo
  const items = useMemo(() => {
    if (status === "authenticated") {
      // console.log("useCart: Returning connected items", connectedItems);
      return connectedItems;
    } else {
      // Pour forcer un nouvel objet à chaque update (important pour Zustand + React)
      return [...localItems];
    }
  }, [status, connectedItems, localItems, lastUpdate]);

  const totalCount = useMemo(() => {
    if (status === "authenticated") {
      const count = connectedItems.reduce((sum, item) => sum + item.quantity, 0);
      // console.log("useCart: Total count (connected)", count);
      return count;
    } else {
      const count = localItems.reduce((sum, item) => sum + item.quantity, 0);
      // console.log("useCart: Total count (local)", count);
      return count;
    }
  }, [status, connectedItems, localItems, lastUpdate]);

  const totalPrice = useMemo(() => {
    if (status === "authenticated") {
      const total = connectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      // console.log("useCart: Total price (connected)", total);
      return total;
    } else {
      const total = localItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      // console.log("useCart: Total price (local)", total);
      return total;
    }
  }, [status, connectedItems, localItems, lastUpdate]);

  return {
    // État
    items,
    isLoading,
    isAuthenticated: status === "authenticated",
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalCount: () => totalCount,
    getTotalPrice: () => totalPrice,
    
    // Utilitaires
    loadCartFromDatabase,
  };
} 