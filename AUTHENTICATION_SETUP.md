# 🔐 Configuration de l'Authentification

Ce document explique comment configurer et utiliser le système d'authentification de l'application e-commerce.

## 📋 Prérequis

1. **Base de données MySQL** configurée et accessible
2. **Variables d'environnement** configurées dans `.env.local`
3. **Prisma** configuré et migré

## 🚀 Configuration Initiale

### 1. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce"

# NextAuth
NEXTAUTH_SECRET="votre-secret-tres-securise-ici"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (optionnel pour les images)
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"
```

### 2. Migration de la Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Voir les données dans Prisma Studio
npx prisma studio
```

### 3. Créer un Utilisateur Administrateur

```bash
# Exécuter le script de création d'admin
npm run create-admin
```

Cela créera un utilisateur admin avec :
- **Email**: admin@example.com
- **Mot de passe**: admin123
- **Rôle**: ADMIN

## 🔑 Utilisation

### Connexion Utilisateur Standard

1. Aller sur `/register` pour créer un compte
2. Aller sur `/login` pour se connecter
3. Les utilisateurs normaux sont redirigés vers la page d'accueil

### Connexion Administrateur

1. Aller sur `/admin/login`
2. Utiliser les identifiants admin créés précédemment
3. Les administrateurs sont redirigés vers `/admin/dashboard`

### Déconnexion

- Utiliser le bouton "Déconnexion" dans le header
- Ou aller sur `/api/auth/signout`

## 🛡️ Protection des Routes

### Routes Protégées

- `/admin/*` - Nécessite une authentification admin
- `/profile` - Nécessite une authentification utilisateur
- `/cart` - Nécessite une authentification utilisateur

### Middleware

Le middleware `src/middleware.ts` protège automatiquement :
- Toutes les routes `/admin/*` (sauf login et setup)
- Vérifie le rôle ADMIN pour l'accès aux pages d'administration

## 🔧 API Routes

### Inscription
- **POST** `/api/auth/register`
- **Body**: `{ email, password, firstName, lastName }`
- **Retour**: Utilisateur créé ou erreur

### Connexion (NextAuth)
- **POST** `/api/auth/signin`
- **Body**: `{ email, password }`
- **Retour**: Session JWT

### Déconnexion
- **POST** `/api/auth/signout`
- **Retour**: Déconnexion et suppression de la session

## 🎣 Hooks Personnalisés

### useAuth

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { 
    session, 
    isAuthenticated, 
    isLoading, 
    isAdmin, 
    login, 
    logout 
  } = useAuth();

  if (isLoading) return <div>Chargement...</div>;
  
  if (!isAuthenticated) return <div>Veuillez vous connecter</div>;

  return (
    <div>
      <p>Bonjour {session?.user?.firstName}!</p>
      {isAdmin && <p>Vous êtes administrateur</p>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

## 🛠️ Composants de Protection

### ProtectedRoute

```typescript
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Route protégée pour utilisateurs authentifiés
<ProtectedRoute>
  <MyProtectedComponent />
</ProtectedRoute>

// Route protégée pour administrateurs
<ProtectedRoute requireAdmin>
  <AdminComponent />
</ProtectedRoute>
```

## 🔍 Débogage

### Vérifier l'État de l'Authentification

```typescript
import { useSession } from "next-auth/react";

function DebugAuth() {
  const { data: session, status } = useSession();
  
  console.log("Status:", status);
  console.log("Session:", session);
  
  return <div>Debug info dans la console</div>;
}
```

### Logs de Base de Données

```bash
# Voir les utilisateurs dans la base
npx prisma studio

# Ou utiliser une requête directe
npx prisma db execute --stdin
```

## 🚨 Sécurité

### Bonnes Pratiques

1. **Mots de passe forts** - Minimum 6 caractères
2. **Hachage bcrypt** - Coût de 12 pour le hachage
3. **Validation côté serveur** - Toujours valider les données
4. **HTTPS en production** - Utiliser des certificats SSL
5. **Secrets sécurisés** - Ne jamais commiter les secrets

### Variables d'Environnement de Production

```env
# Production
NEXTAUTH_SECRET="secret-tres-long-et-aleatoire"
NEXTAUTH_URL="https://votre-domaine.com"
DATABASE_URL="mysql://user:pass@host:3306/db?ssl=true"
```

## 🐛 Résolution de Problèmes

### Erreur "Invalid credentials"

1. Vérifier que l'utilisateur existe en base
2. Vérifier que le mot de passe est correct
3. Vérifier la configuration bcrypt

### Erreur "Access denied"

1. Vérifier le rôle de l'utilisateur (USER vs ADMIN)
2. Vérifier la configuration du middleware
3. Vérifier les permissions de base de données

### Erreur de connexion à la base

1. Vérifier l'URL de connexion MySQL
2. Vérifier que MySQL est démarré
3. Vérifier les permissions utilisateur

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js/) 