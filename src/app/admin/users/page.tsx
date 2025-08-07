import { Suspense } from 'react'
import { Metadata } from 'next'
import { UserTable, LoadingState } from '@/components/admin/users'
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Gestion des Clients | Administration NUMA',
  description: 'Gérez les clients de votre boutique de vêtements NUMA'
}

interface UsersPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header moderne */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 antialiased">👥 Gestion des Clients</h1>
            <p className="text-gray-600 mt-1 antialiased">Gérez les comptes clients de votre boutique de vêtements</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              href="/admin/users/reset-requests" 
              className="admin-button-secondary"
            >
              📧 Demandes de réinitialisation
            </Link>

          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="admin-card">
        <Suspense fallback={<LoadingState />}>
          <UserTable 
            page={page}
          />
        </Suspense>
      </div>
    </div>
  )
}