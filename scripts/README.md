# Script de Seeding des Données

Ce script permet d'ajouter automatiquement des catégories et produits avec des images valides dans votre base de données e-commerce.

## 🚀 Utilisation

### Prérequis
- Base de données configurée et migrée
- Variables d'environnement configurées (DATABASE_URL)

### Exécution du script

```bash
# Option 1: Utiliser le script npm
npm run seed

# Option 2: Exécuter directement avec tsx
npx tsx scripts/seed-data.ts

# Option 3: Compiler et exécuter
npx tsc scripts/seed-data.ts
node scripts/seed-data.js
```

## 📊 Données ajoutées

### Catégories (8 catégories)
- **Électronique** - Smartphones, ordinateurs, tablettes
- **Mode & Accessoires** - Vêtements, chaussures, montres
- **Maison & Jardin** - Décoration, électroménager
- **Sport & Loisirs** - Équipements sportifs
- **Beauté & Santé** - Produits de beauté et santé
- **Livres & Médias** - Livres, musique, jeux
- **Automobile** - Pièces et accessoires auto
- **Bébé & Enfant** - Articles pour enfants

### Produits (24 produits)
Chaque catégorie contient 3 produits avec :
- ✅ Images valides (Unsplash)
- ✅ Prix en FCFA (XOF)
- ✅ Descriptions détaillées
- ✅ Stock réaliste
- ✅ SKU générés automatiquement
- ✅ Statut PUBLISHED

### Publicités (2 publicités)
- Promotion Électronique
- Mode & Accessoires

## 🖼️ Images utilisées

Le script utilise des images d'Unsplash optimisées :
- **Catégories** : 400x300px
- **Produits** : 500x500px
- **Publicités** : 800x400px

## 🔧 Fonctionnalités

- ✅ Gestion des doublons (évite les erreurs)
- ✅ Génération automatique de slugs
- ✅ SKU uniques par catégorie
- ✅ Images multiples pour les produits
- ✅ Prix de comparaison pour les promotions
- ✅ Produits "meilleurs" marqués (isBest: true)

## 🛠️ Personnalisation

Pour modifier les données :

1. **Ajouter des catégories** : Modifiez `categoriesData`
2. **Ajouter des produits** : Modifiez `productsData`
3. **Changer les images** : Modifiez `categoryImages` et `productImages`
4. **Modifier les prix** : Ajustez les valeurs `price` et `comparePrice`

## 📝 Logs

Le script affiche des logs détaillés :
- ✅ Succès de création
- ⚠️ Éléments déjà existants
- ❌ Erreurs éventuelles

## 🔄 Réexécution

Le script peut être réexécuté sans problème :
- Les éléments existants sont ignorés
- Seuls les nouveaux éléments sont créés
- Pas de doublons générés 