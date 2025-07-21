# 📋 SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES
## Projet E-commerce Next.js + MySQL + Prisma

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique

#### Frontend
- **Framework** : Next.js 14 (React 18)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **State Management** : Zustand ou Context API
- **Forms** : React Hook Form + Zod
- **Icons** : Heroicons
- **UI Components** : Shadcn/ui (optionnel)

#### Backend
- **Runtime** : Node.js 18+
- **Framework** : Next.js API Routes
- **Database** : MySQL 8.0
- **ORM** : Prisma
- **Authentication** : NextAuth.js
- **Validation** : Zod

#### Services Externes
- **Paiement** : Stripe (recommandé) ou PayPal
- **Images** : Cloudinary ou AWS S3
- **Email** : SendGrid ou Resend
- **Analytics** : Google Analytics 4
- **Monitoring** : Sentry (optionnel)

#### Déploiement
- **Hosting** : Vercel (Next.js)
- **Database** : PlanetScale, Railway, ou VPS
- **Domain** : Configuration DNS
- **SSL** : Certificat automatique (Vercel)

---

## 🗄️ STRUCTURE DE BASE DE DONNÉES

### Schéma Prisma Complet

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  orders        Order[]
  cartItems     CartItem[]
  addresses     Address[]
  reviews       Review[]
  
  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2)
  stock       Int      @default(0)
  sku         String?  @unique
  weight      Float?
  dimensions  String?
  imageUrl    String?
  images      String[] // JSON array of image URLs
  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  category    Category     @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  cartItems   CartItem[]
  reviews     Review[]
  
  @@map("products")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  isActive    Boolean   @default(true)
  parentId    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  products    Product[]
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  
  @@map("categories")
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String
  status          OrderStatus @default(PENDING)
  subtotal        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2)
  shipping        Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  currency        String      @default("XOF")
  shippingAddress String      @db.Text
  billingAddress  String?     @db.Text
  notes           String?
  paymentIntentId String?
  paymentStatus   PaymentStatus @default(PENDING)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  user       User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]
  
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  name      String  // Snapshot of product name
  sku       String? // Snapshot of product SKU
  
  // Relations
  order   Order   @relation(fields: [orderId], references: [id])
  product Product @relation(fields: [productId], references: [id])
  
  @@map("order_items")
}

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int
  createdAt DateTime @default(now())
  
  // Relations
  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
  
  @@unique([userId, productId])
  @@map("cart_items")
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  type        AddressType
  firstName   String
  lastName    String
  company     String?
  address1    String
  address2    String?
  city        String
  state       String?
  postalCode  String
  country     String
  phone       String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user User @relation(fields: [userId], references: [id])
  
  @@map("addresses")
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int      // 1-5 stars
  title     String?
  comment   String?  @db.Text
  isVerified Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
  
  @@unique([userId, productId])
  @@map("reviews")
}

// Enums
enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum AddressType {
  SHIPPING
  BILLING
}
```

---

## 📁 STRUCTURE DES DOSSIERS

```
e-commerce/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Groupe de routes auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (shop)/                   # Groupe de routes boutique
│   │   │   ├── page.tsx              # Page d'accueil
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Catalogue
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Page produit
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Page catégorie
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # Panier
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx          # Checkout
│   │   │   │   └── success/
│   │   │   │       └── page.tsx      # Confirmation
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Profil
│   │   │   │   ├── orders/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Détail commande
│   │   │   │   └── addresses/
│   │   │   │       └── page.tsx      # Adresses
│   │   │   └── layout.tsx
│   │   ├── admin/                    # Routes administration
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Liste produits
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Nouveau produit
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Éditer produit
│   │   │   ├── categories/
│   │   │   │   └── page.tsx          # Gestion catégories
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Liste commandes
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Détail commande
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # Gestion utilisateurs
│   │   │   └── layout.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts          # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PUT, DELETE
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── cart/
│   │   │   │   └── route.ts
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # Composants réutilisables
│   │   ├── ui/                       # Composants UI de base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── forms/                    # Composants de formulaires
│   │   │   ├── product-form.tsx
│   │   │   ├── checkout-form.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Composants de layout
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── navigation.tsx
│   │   ├── shop/                     # Composants boutique
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── cart-item.tsx
│   │   │   └── ...
│   │   └── admin/                    # Composants admin
│   │       ├── dashboard-stats.tsx
│   │       ├── order-table.tsx
│   │       └── ...
│   ├── lib/                          # Utilitaires et configurations
│   │   ├── prisma.ts                 # Client Prisma
│   │   ├── auth.ts                   # Configuration NextAuth
│   │   ├── stripe.ts                 # Configuration Stripe
│   │   ├── cloudinary.ts             # Configuration Cloudinary
│   │   ├── utils.ts                  # Fonctions utilitaires
│   │   └── validations.ts            # Schémas Zod
│   ├── hooks/                        # Custom hooks
│   │   ├── use-cart.ts
│   │   ├── use-products.ts
│   │   ├── use-orders.ts
│   │   └── ...
│   ├── store/                        # Gestion d'état (Zustand)
│   │   ├── cart-store.ts
│   │   ├── auth-store.ts
│   │   └── ...
│   └── types/                        # Types TypeScript
│       ├── product.ts
│       ├── order.ts
│       ├── user.ts
│       └── ...
├── prisma/
│   ├── schema.prisma                 # Schéma de base de données
│   ├── migrations/                   # Migrations
│   └── seed.ts                       # Données de test
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
├── .env.local                        # Variables d'environnement
├── .env.example                      # Exemple de variables
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── README.md
```

---

## 🔐 AUTHENTIFICATION ET SÉCURITÉ

### Configuration NextAuth.js

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    signUp: "/register"
  }
}
```

### Middleware de Protection

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/checkout/:path*"]
}
```

---

## 💳 INTÉGRATION PAIEMENT STRIPE

### Configuration Stripe

```typescript
// src/lib/stripe.ts
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true
})

export const createPaymentIntent = async (amount: number, currency: string = "xof") => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe utilise les centimes
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export const createCheckoutSession = async (lineItems: any[], successUrl: string, cancelUrl: string) => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}
```

### API Route Checkout

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { items, shippingAddress } = await req.json()

    // Vérifier le stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product?.name}` },
          { status: 400 }
        )
      }
    }

    // Calculer le total
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)
    
    const tax = subtotal * 0.20 // 20% TVA
    const shipping = 5.99 // Frais de livraison
    const total = subtotal + tax + shipping

    // Créer l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "xof",
      metadata: {
        userId: session.user.id,
        items: JSON.stringify(items)
      }
    })

    // Créer la commande en base
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: session.user.id,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentIntentId: paymentIntent.id
      }
    })

    // Créer les éléments de commande
    await prisma.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        sku: item.sku
      }))
    })

    // Décrémenter le stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    })

  } catch (error) {
    console.error("Erreur checkout:", error)
    return NextResponse.json(
      { error: "Erreur lors du checkout" },
      { status: 500 }
    )
  }
}
```

---

## 🖼️ GESTION DES IMAGES

### Configuration Cloudinary

```typescript
// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "e-commerce",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result!.secure_url)
        }
      }
    ).end(buffer)
  })
}

export const deleteImage = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId)
}
```

### API Route Upload

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Fichier non supporté" }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 })
    }

    const imageUrl = await uploadImage(file)

    return NextResponse.json({ imageUrl })

  } catch (error) {
    console.error("Erreur upload:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    )
  }
}
```

---

## 📊 VALIDATION DES DONNÉES

### Schémas Zod

```typescript
// src/lib/validations.ts
import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  slug: z.string().min(1, "Le slug est requis").max(100),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  sku: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).optional()
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    name: z.string(),
    sku: z.string().optional()
  })).min(1, "Au moins un produit est requis"),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional()
  })
})

export const userSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis")
})
```

---

## 🚀 CONFIGURATION DE DÉPLOIEMENT

### Variables d'Environnement

```bash
# .env.local
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (optionnel)
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yourdomain.com"

# Analytics (optionnel)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### Configuration Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "CLOUDINARY_API_SECRET": "@cloudinary-api-secret"
  }
}
```

### Scripts Package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## 📈 OPTIMISATIONS PERFORMANCE

### Mise en Cache

```typescript
// src/hooks/use-products.ts
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProducts(categoryId?: string) {
  const url = categoryId 
    ? `/api/products?categoryId=${categoryId}`
    : "/api/products"
    
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000 // 1 minute
  })

  return {
    products: data,
    isLoading,
    isError: error,
    mutate
  }
}
```

### Optimisation des Images

```typescript
// src/components/ui/optimized-image.tsx
import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          duration-700 ease-in-out
          ${isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  )
}
```

---

## 🔍 MONITORING ET ANALYTICS

### Configuration Google Analytics

```typescript
// src/lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID!, {
      page_location: url,
    })
  }
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
```

### Tracking des Événements

```typescript
// Exemple d'utilisation dans un composant
import { event } from "@/lib/analytics"

// Ajout au panier
const addToCart = (product: Product) => {
  // Logique d'ajout au panier
  
  // Tracking
  event({
    action: "add_to_cart",
    category: "ecommerce",
    label: product.name,
    value: product.price
  })
}

// Achat
const purchase = (order: Order) => {
  // Logique d'achat
  
  // Tracking
  event({
    action: "purchase",
    category: "ecommerce",
    label: order.orderNumber,
    value: order.total
  })
}
```

---

Cette documentation technique détaillée vous donne tous les éléments nécessaires pour implémenter votre e-commerce avec Next.js, MySQL et Prisma. Adaptez ces spécifications selon vos besoins spécifiques et votre niveau d'expérience technique. 