import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
      title: 'Utilisateur non trouvé | Administration'
    }
  }

  return {
    title: `${user.firstName} ${user.lastName} | Détails Utilisateur`,
    description: `Détails de l'utilisateur ${user.email}`
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
    <div className="space-y-6">
      <Suspense fallback={<LoadingState />}>
        <UserDetails user={user} />
      </Suspense>
      
      <Suspense fallback={<LoadingState />}>
        <UserOrders userId={user.id} />
      </Suspense>
    </div>
  )
} 