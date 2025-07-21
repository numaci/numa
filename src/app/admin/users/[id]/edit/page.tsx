import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UserEditForm } from '@/components/admin/users/UserEditForm'
import { LoadingState } from '@/components/admin/users/LoadingState'
import { prisma } from '@/lib/prisma'

interface UserEditPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: UserEditPageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true, email: true }
  })

  if (!user) {
    return {
      title: 'Utilisateur non trouvé | Administration'
    }
  }

  return {
    title: `Modifier ${user.firstName} ${user.lastName} | Administration`,
    description: `Modifier les informations de l'utilisateur ${user.email}`
  }
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier l'utilisateur
          </h1>
          <p className="text-gray-600 mt-1">
            Modifiez les informations de {user.firstName} {user.lastName}
          </p>
        </div>
      </div>
      
      <Suspense fallback={<LoadingState />}>
        <UserEditForm user={user} />
      </Suspense>
    </div>
  )
} 