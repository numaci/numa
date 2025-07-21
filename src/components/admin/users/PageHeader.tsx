import Link from 'next/link'
import { Users, Plus } from 'lucide-react'
import { FaBell } from 'react-icons/fa'
import { prisma } from '@/lib/prisma'

export async function PageHeader() {
  // Compter les demandes de reset en attente
  const count = await prisma.passwordResetRequest.count({ where: { status: 'pending' } });
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-extrabold text-orange-700 drop-shadow mb-1">
          Gestion des Utilisateurs
        </h1>
        <p className="text-orange-400 font-medium">
          Gérez les comptes utilisateurs de votre boutique
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/users/reset-requests"
          className="relative inline-flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition text-lg"
        >
          <FaBell className="h-5 w-5 mr-2" />
          Demandes
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">{count}</span>
          )}
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition text-lg"
        >
          <Users className="h-4 w-4 mr-2" />
          Voir tous les utilisateurs
        </Link>
      </div>
    </div>
  )
} 