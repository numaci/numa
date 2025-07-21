import { Suspense } from 'react'
import { Metadata } from 'next'
import { UserTable, UserFilters, PageHeader, LoadingState } from '@/components/admin/users'
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs | Administration',
  description: 'Gérez les utilisateurs de votre boutique en ligne'
}

interface UsersPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    role?: string
    status?: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const role = params.role || ''
  const status = params.status || ''

  return (
    <div className="space-y-6">
      <PageHeader />
      <div className="flex justify-end gap-4">
        <Link href="/admin/users/new" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-full shadow transition-all duration-200">
          Ajouter un admin
        </Link>
        <Link href="/admin/users/reset-requests" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-full shadow transition-all duration-200">
          Voir les demandes de réinitialisation
        </Link>
      </div>
      <UserFilters 
        search={search}
        role={role}
        status={status}
      />
      
      <Suspense fallback={<LoadingState />}>
        <UserTable 
          page={page}
          search={search}
          role={role}
          status={status}
        />
      </Suspense>
    </div>
  )
} 