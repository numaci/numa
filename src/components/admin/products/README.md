# Composants de Gestion des Produits

Ce dossier contient tous les composants réutilisables pour la gestion des produits dans l'interface d'administration.

## 📁 Structure des fichiers

```
src/components/admin/products/
├── index.ts              # Export centralisé de tous les composants
├── ProductFilters.tsx    # Composant des filtres de recherche
├── ProductTable.tsx      # Composant du tableau des produits
├── Pagination.tsx        # Composant de pagination
├── DeleteModal.tsx       # Modal de confirmation de suppression
├── LoadingState.tsx      # État de chargement
├── ErrorState.tsx        # État d'erreur
├── PageHeader.tsx        # En-tête de page avec actions
└── README.md            # Documentation (ce fichier)
```

## 🧩 Composants

### ProductFilters
**Fichier :** `ProductFilters.tsx`

Composant pour les filtres de recherche et de tri des produits.

**Props :**
- `searchTerm: string` - Terme de recherche
- `selectedCategory: string` - Catégorie sélectionnée
- `statusFilter: string` - Filtre par statut
- `categories: Category[]` - Liste des catégories disponibles
- `onSearchChange: (value: string) => void` - Callback pour la recherche
- `onCategoryChange: (value: string) => void` - Callback pour le changement de catégorie
- `onStatusChange: (value: string) => void` - Callback pour le changement de statut
- `onReset: () => void` - Callback pour réinitialiser les filtres

**Utilisation :**
```tsx
<ProductFilters
  searchTerm={filters.search}
  selectedCategory={filters.category}
  statusFilter={filters.status}
  categories={categories}
  onSearchChange={(value) => updateFilters({ search: value })}
  onCategoryChange={(value) => updateFilters({ category: value })}
  onStatusChange={(value) => updateFilters({ status: value })}
  onReset={resetFilters}
/>
```

### ProductTable
**Fichier :** `ProductTable.tsx`

Composant pour afficher le tableau des produits avec toutes les actions.

**Props :**
- `products: Product[]` - Liste des produits à afficher
- `onDelete: (productId: string) => void` - Callback pour la suppression

**Fonctionnalités :**
- Affichage des informations produit (nom, catégorie, prix, stock, statut, date)
- Actions (voir, modifier, supprimer)
- Statuts visuels avec codes couleur
- Formatage automatique des prix et dates

### Pagination
**Fichier :** `Pagination.tsx`

Composant de pagination réutilisable avec navigation complète.

**Props :**
- `currentPage: number` - Page actuelle
- `totalPages: number` - Nombre total de pages
- `totalItems: number` - Nombre total d'éléments
- `itemsPerPage: number` - Nombre d'éléments par page
- `onPageChange: (page: number) => void` - Callback pour le changement de page

**Fonctionnalités :**
- Navigation par numéros de pages
- Boutons précédent/suivant
- Affichage des informations de pagination
- Version responsive (mobile/desktop)

### DeleteModal
**Fichier :** `DeleteModal.tsx`

Modal de confirmation pour les actions de suppression.

**Props :**
- `isOpen: boolean` - État d'ouverture de la modal
- `onClose: () => void` - Callback pour fermer la modal
- `onConfirm: () => void` - Callback pour confirmer la suppression
- `title?: string` - Titre de la modal (optionnel)
- `message?: string` - Message de confirmation (optionnel)
- `confirmText?: string` - Texte du bouton de confirmation (optionnel)
- `cancelText?: string` - Texte du bouton d'annulation (optionnel)

### LoadingState
**Fichier :** `LoadingState.tsx`

Composant pour afficher l'état de chargement.

**Props :**
- `message?: string` - Message à afficher (optionnel, défaut: "Chargement...")

### ErrorState
**Fichier :** `ErrorState.tsx`

Composant pour afficher l'état d'erreur avec possibilité de retry.

**Props :**
- `error: string` - Message d'erreur à afficher
- `onRetry?: () => void` - Callback pour réessayer (optionnel)
- `retryText?: string` - Texte du bouton de retry (optionnel, défaut: "Réessayer")

### PageHeader
**Fichier :** `PageHeader.tsx`

Composant d'en-tête de page avec titre, sous-titre et action principale.

**Props :**
- `title: string` - Titre de la page
- `subtitle?: string` - Sous-titre (optionnel)
- `actionLabel?: string` - Texte du bouton d'action (optionnel)
- `actionHref?: string` - Lien du bouton d'action (optionnel)
- `actionIcon?: React.ReactNode` - Icône du bouton d'action (optionnel)

## 🎣 Hook personnalisé

### useProducts
**Fichier :** `src/hooks/useProducts.ts`

Hook personnalisé qui encapsule toute la logique de gestion des produits.

**Retourne :**
```typescript
{
  // États
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  pagination: PaginationState
  filters: ProductFilters
  deleteModalOpen: boolean
  
  // Actions
  fetchProducts: () => Promise<void>
  updateFilters: (filters: Partial<ProductFilters>) => void
  changePage: (page: number) => void
  resetFilters: () => void
  openDeleteModal: (productId: string) => void
  closeDeleteModal: () => void
  confirmDelete: () => Promise<void>
}
```

## 🔧 Utilisation dans une page

```tsx
"use client";

import {
  ProductFilters,
  ProductTable,
  Pagination,
  DeleteModal,
  LoadingState,
  ErrorState,
  PageHeader,
} from "@/components/admin/products";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const {
    products,
    categories,
    loading,
    error,
    pagination,
    filters,
    deleteModalOpen,
    fetchProducts,
    updateFilters,
    changePage,
    resetFilters,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Produits"
        subtitle="Gérez votre catalogue de produits"
        actionLabel="Nouveau Produit"
        actionHref="/admin/products/new"
      />

      <ProductFilters
        searchTerm={filters.search}
        selectedCategory={filters.category}
        statusFilter={filters.status}
        categories={categories}
        onSearchChange={(value) => updateFilters({ search: value })}
        onCategoryChange={(value) => updateFilters({ category: value })}
        onStatusChange={(value) => updateFilters({ status: value })}
        onReset={resetFilters}
      />

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <LoadingState message="Chargement des produits..." />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchProducts} />
        ) : (
          <>
            <ProductTable
              products={products}
              onDelete={openDeleteModal}
            />
            
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={changePage}
            />
          </>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ?"
      />
    </div>
  );
}
```

## 🎨 Avantages de cette architecture

1. **Réutilisabilité** : Chaque composant peut être utilisé indépendamment
2. **Maintenabilité** : Logique séparée dans des composants spécialisés
3. **Testabilité** : Composants isolés plus faciles à tester
4. **Performance** : Re-renders optimisés grâce à la séparation des responsabilités
5. **Lisibilité** : Code plus clair et organisé
6. **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités

## 🔄 Évolutions futures

- Ajout de composants pour le tri avancé
- Composants pour les actions en lot
- Composants pour l'export/import de données
- Composants pour les statistiques et graphiques
- Composants pour la gestion des images 