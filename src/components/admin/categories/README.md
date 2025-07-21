# 📂 Composants de Gestion des Catégories

Ce dossier contient tous les composants modulaires pour la gestion des catégories dans l'interface d'administration.

## 🏗️ Architecture

### Composants de Liste

#### `CategoryFilters.tsx`
- **Rôle** : Filtres et recherche pour les catégories
- **Props** : `searchTerm`, `statusFilter`, `onSearchChange`, `onStatusChange`, `onReset`
- **Fonctionnalités** : Recherche par texte, filtrage par statut, réinitialisation

#### `CategoryTable.tsx`
- **Rôle** : Tableau d'affichage des catégories
- **Props** : `categories`, `onDelete`
- **Fonctionnalités** : Affichage en tableau, actions (modifier, supprimer), gestion des états vides

#### `PageHeader.tsx`
- **Rôle** : En-tête de page avec titre et bouton d'action
- **Props** : `title`, `subtitle`, `actionLabel`, `actionHref`
- **Fonctionnalités** : Titre, sous-titre, bouton d'action optionnel

### Composants d'État

#### `LoadingState.tsx`
- **Rôle** : Affichage de l'état de chargement
- **Props** : `message`
- **Fonctionnalités** : Spinner animé, message personnalisable

#### `ErrorState.tsx`
- **Rôle** : Affichage des erreurs
- **Props** : `error`, `onRetry`
- **Fonctionnalités** : Message d'erreur, bouton de retry optionnel

#### `DeleteModal.tsx`
- **Rôle** : Modal de confirmation de suppression
- **Props** : `isOpen`, `onClose`, `onConfirm`, `categoryName`, `productCount`, `loading`
- **Fonctionnalités** : Confirmation, vérification des produits associés, protection contre la suppression

### Composants de Formulaire

#### `forms/CategoryFormSection.tsx`
- **Rôle** : Conteneur pour les sections du formulaire
- **Props** : `title`, `children`, `className`
- **Utilisation** : Encapsule chaque section avec un titre et un style cohérent

#### `forms/FormField.tsx`
- **Rôle** : Champ de formulaire réutilisable
- **Props** : `label`, `name`, `error`, `required`, `children`, `className`
- **Utilisation** : Wrapper pour tous les champs avec validation

#### `forms/CategoryBasicInfo.tsx`
- **Rôle** : Section des informations de base
- **Champs** : Nom, slug, description
- **Fonctionnalités** : Génération automatique du slug, validation

#### `forms/CategoryOptions.tsx`
- **Rôle** : Options de visibilité
- **Champs** : Catégorie active
- **Interface** : Checkbox avec explications

#### `forms/FormActions.tsx`
- **Rôle** : Boutons d'action du formulaire
- **Fonctionnalités** : Sauvegarde, annulation, gestion des erreurs

#### `forms/PageHeader.tsx`
- **Rôle** : En-tête de page avec navigation
- **Fonctionnalités** : Titre, sous-titre, bouton retour

## 🎣 Hooks Personnalisés

### `useCategories.ts`
- **Rôle** : Logique métier pour la liste des catégories
- **Fonctionnalités** :
  - Gestion des états (catégories, loading, erreurs)
  - Filtrage et recherche
  - CRUD complet
  - Gestion du modal de suppression

### `useCategoryForm.ts`
- **Rôle** : Logique métier pour les formulaires de catégories
- **Fonctionnalités** :
  - Gestion des états du formulaire
  - Validation des données
  - Soumission du formulaire
  - Gestion des erreurs
  - Support création et modification

## 📋 Utilisation

### Dans une page de liste
```tsx
import { useCategories } from "@/hooks/useCategories";
import { CategoryFilters, CategoryTable } from "@/components/admin/categories";

export default function CategoriesPage() {
  const { categories, loading, filters, updateFilters } = useCategories();

  return (
    <div>
      <CategoryFilters
        searchTerm={filters.search}
        statusFilter={filters.status}
        onSearchChange={(value) => updateFilters({ search: value })}
        onStatusChange={(value) => updateFilters({ status: value })}
      />
      <CategoryTable categories={categories} onDelete={openDeleteModal} />
    </div>
  );
}
```

### Dans une page de formulaire
```tsx
import { useCategoryForm } from "@/hooks/useCategoryForm";
import { CategoryFormSection, CategoryBasicInfo } from "@/components/admin/categories/forms";

export default function NewCategoryPage() {
  const { formData, loading, errors, handleInputChange, handleSubmit } = useCategoryForm();

  return (
    <form onSubmit={handleSubmit}>
      <CategoryFormSection title="Informations de base">
        <CategoryBasicInfo
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
        />
      </CategoryFormSection>
    </form>
  );
}
```

## 🔧 Personnalisation

### Ajout d'un nouveau champ
1. Créer le champ dans le composant approprié
2. Ajouter la validation dans `useCategoryForm`
3. Mettre à jour les types TypeScript

### Modification du style
- Les classes Tailwind sont centralisées dans chaque composant
- Utiliser les props `className` pour des personnalisations

### Ajout d'une nouvelle section
1. Créer un nouveau composant spécialisé
2. L'encapsuler dans `CategoryFormSection`
3. L'ajouter au formulaire principal

## 🎯 Avantages

### Modulaire
- Chaque composant a une responsabilité unique
- Réutilisable dans différents contextes
- Facile à tester individuellement

### Maintenable
- Code organisé et lisible
- Séparation claire des responsabilités
- Documentation intégrée

### Extensible
- Architecture flexible pour ajouter de nouvelles fonctionnalités
- Hooks personnalisés pour la logique métier
- Composants indépendants

## 🚀 Prochaines Étapes

1. **Tests unitaires** : Ajouter des tests pour chaque composant
2. **Validation avancée** : Implémenter une validation en temps réel
3. **Fonctionnalités avancées** : 
   - Drag & drop pour réorganiser les catégories
   - Import/export en CSV
   - Historique des modifications
4. **Accessibilité** : Améliorer l'accessibilité des composants 