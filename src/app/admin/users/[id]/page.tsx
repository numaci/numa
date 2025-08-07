import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { UserDetails, UserOrders, LoadingState } from '@/components/admin/users'
import { prisma } from '@/lib/prisma'

interface UserPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true, email: true }
  })

  if (!user) {
    return {
      title: 'Client non trouvé | Administration NUMA'
    }
  }

  return {
    title: `${user.firstName} ${user.lastName} | Profil Client NUMA`,
    description: `Profil et commandes du client ${user.email} - Boutique NUMA`
  }
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      addresses: true
    }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/admin/users"
            className="admin-button-secondary"
          >
            ← Retour aux clients
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 antialiased">
            👤 {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mt-1 antialiased">
            Profil client et historique des commandes dans votre boutique NUMA
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        <Suspense fallback={<LoadingState />}>
          <UserDetails user={user} />
        </Suspense>
        
        <Suspense fallback={<LoadingState />}>
          <UserOrders userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}