# 🚀 Configuration du Projet E-commerce

## 📋 Prérequis

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## ⚙️ Configuration Initiale

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

1. **Créez une base de données MySQL :**
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Créez le fichier `.env.local` :**
```env
# Configuration de la base de données MySQL
DATABASE_URL="mysql://ecommerce_user:votre_mot_de_passe@localhost:3306/ecommerce_db"

# Clé secrète pour NextAuth.js
NEXTAUTH_SECRET="votre_cle_secrete_ici"

# URL de base de votre application
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Génération de la clé secrète

```bash
# Sur Windows (PowerShell)
openssl rand -base64 32

# Sur macOS/Linux
openssl rand -base64 32
```

### 4. Migration de la base de données

```bash
# Génération du client Prisma
npx prisma generate

# Application des migrations
npx prisma migrate dev
```

### 5. Création du premier administrateur

1. **Démarrez le serveur de développement :**
```bash
npm run dev
```

2. **Accédez à la page de configuration :**
```
http://localhost:3000/admin/setup
```

3. **Créez votre compte administrateur** avec :
   - Prénom et nom
   - Email
   - Mot de passe (minimum 6 caractères)

### 6. Connexion à l'administration

1. **Accédez à la page de connexion :**
```
http://localhost:3000/admin/login
```

2. **Connectez-vous** avec vos identifiants

3. **Accédez au dashboard :**
```
http://localhost:3000/admin/dashboard
```

## 🛠️ Commandes Utiles

```bash
# Démarrage en développement
npm run dev

# Build pour la production
npm run build

# Démarrage en production
npm start

# Vérification du linting
npm run lint

# Ouverture de Prisma Studio (interface DB)
npx prisma studio

# Reset de la base de données
npx prisma migrate reset

# Génération d'une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration
```

## 📁 Structure du Projet

```
e-commerce/
├── src/
│   ├── app/                    # Pages Next.js 14 (App Router)
│   │   ├── admin/             # Interface d'administration
│   │   │   ├── dashboard/     # Tableau de bord
│   │   │   ├── login/         # Page de connexion
│   │   │   └── setup/         # Configuration initiale
│   │   └── api/               # Routes API
│   │       ├── auth/          # Authentification NextAuth
│   │       └── admin/         # APIs administration
│   ├── components/            # Composants réutilisables
│   ├── lib/                   # Utilitaires (Prisma, auth)
│   ├── types/                 # Types TypeScript
│   └── hooks/                 # Custom hooks
├── prisma/
│   ├── schema.prisma          # Modèles de données
│   └── migrations/            # Migrations DB
└── public/                    # Assets statiques
```

## 🔐 Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les routes admin sont protégées par middleware
- Validation côté client et serveur
- Sessions sécurisées avec JWT

## 🚨 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que MySQL est démarré
- Vérifiez les informations de connexion dans `.env.local`
- Testez la connexion : `mysql -u ecommerce_user -p ecommerce_db`

### Erreur de migration
- Supprimez le dossier `prisma/migrations`
- Relancez : `npx prisma migrate dev`

### Erreur d'authentification
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL

## 📞 Support

Pour toute question ou problème, consultez :
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation NextAuth.js](https://next-auth.js.org/) 