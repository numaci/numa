# 📝 Composants de Formulaire de Produit

Ce dossier contient tous les composants modulaires pour la gestion des formulaires de produits dans l'interface d'administration.

## 🏗️ Architecture

### Composants de Base

#### `ProductFormSection.tsx`
- **Rôle** : Conteneur pour les sections du formulaire
- **Props** : `title`, `children`, `className`
- **Utilisation** : Encapsule chaque section du formulaire avec un titre et un style cohérent

#### `FormField.tsx`
- **Rôle** : Champ de formulaire réutilisable avec label et gestion d'erreur
- **Props** : `label`, `name`, `error`, `required`, `children`, `className`
- **Utilisation** : Wrapper pour tous les champs de saisie avec validation

### Composants Spécialisés

#### `ProductBasicInfo.tsx`
- **Rôle** : Section des informations de base du produit
- **Champs** : Nom, slug, description, catégorie, SKU
- **Fonctionnalités** : Génération automatique du slug, sélection de catégorie

#### `ProductPricing.tsx`
- **Rôle** : Section prix, stock et caractéristiques physiques
- **Champs** : Prix principal, prix comparé, stock, poids, dimensions
- **Validation** : Vérification des prix et du stock

#### `ProductImages.tsx`
- **Rôle** : Gestion des images du produit
- **Fonctionnalités** : Upload d'image, aperçu, validation des formats
- **États** : Gestion de l'upload en cours

#### `ProductOptions.tsx`
- **Rôle** : Options de visibilité et de mise en avant
- **Champs** : Produit actif, produit en vedette
- **Interface** : Checkboxes avec explications

### Composants d'Interface

#### `FormActions.tsx`
- **Rôle** : Boutons d'action du formulaire
- **Fonctionnalités** : Sauvegarde, annulation, gestion des erreurs
- **États** : Loading, erreurs générales

#### `PageHeader.tsx`
- **Rôle** : En-tête de page avec navigation
- **Fonctionnalités** : Titre, sous-titre, bouton retour
- **Navigation** : Lien de retour vers la liste

## 🎣 Hook Personnalisé

### `useProductForm.ts`
- **Rôle** : Logique métier du formulaire de produit
- **Fonctionnalités** :
  - Gestion des états du formulaire
  - Validation des données
  - Upload d'images
  - Soumission du formulaire
  - Gestion des erreurs
  - Navigation

## 📋 Utilisation

### Dans une page de création
```tsx
import { useProductForm } from "@/hooks/useProductForm";
import { ProductFormSection, ProductBasicInfo } from "@/components/admin/products/forms";

export default function NewProductPage() {
  const {
    formData,
    categories,
    loading,
    errors,
    handleInputChange,
    handleSubmit,
  } = useProductForm();

  return (
    <form onSubmit={handleSubmit}>
      <ProductFormSection title="Informations de base">
        <ProductBasicInfo
          formData={formData}
          categories={categories}
          errors={errors}
          onInputChange={handleInputChange}
        />
      </ProductFormSection>
    </form>
  );
}
```

### Dans une page de modification
```tsx
// Le même hook peut être étendu pour charger les données existantes
const { formData, loading, handleSubmit } = useProductForm(productId);
```

## 🔧 Personnalisation

### Ajout d'un nouveau champ
1. Créer le champ dans le composant approprié
2. Ajouter la validation dans `useProductForm`
3. Mettre à jour les types TypeScript

### Modification du style
- Les classes Tailwind sont centralisées dans chaque composant
- Utiliser les props `className` pour des personnalisations

### Ajout d'une nouvelle section
1. Créer un nouveau composant spécialisé
2. L'encapsuler dans `ProductFormSection`
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
- Hook personnalisé pour la logique métier
- Composants indépendants

## 🚀 Prochaines Étapes

1. **Tests unitaires** : Ajouter des tests pour chaque composant
2. **Validation avancée** : Implémenter une validation en temps réel
3. **Upload d'images** : Intégrer un service d'upload réel (Cloudinary, AWS S3)
4. **Formulaires dynamiques** : Ajouter des champs personnalisables
5. **Accessibilité** : Améliorer l'accessibilité des formulaires 