'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserFiltersProps {
  search: string
  role: string
  status: string
}

export function UserFilters({ search, role, status }: UserFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(search)
  const [roleValue, setRoleValue] = useState(role)
  const [statusValue, setStatusValue] = useState(status)

  useEffect(() => {
    setSearchValue(search)
    setRoleValue(role)
    setStatusValue(status)
  }, [search, role, status])

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams)
    
    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }
    
    if (roleValue) {
      params.set('role', roleValue)
    } else {
      params.delete('role')
    }
    
    if (statusValue) {
      params.set('status', statusValue)
    } else {
      params.delete('status')
    }
    
    params.delete('page') // Reset to first page
    router.push(`/admin/users?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchValue('')
    setRoleValue('')
    setStatusValue('')
    router.push('/admin/users')
  }

  const hasActiveFilters = search || role || status

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-300 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && updateFilters()}
              className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900 placeholder-orange-300"
            />
          </div>
        </div>
        {/* Filtre Rôle */}
        <div className="md:w-48">
          <select
            value={roleValue}
            onChange={(e) => setRoleValue(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            <option value="">Tous les rôles</option>
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
        {/* Filtre Statut */}
        <div className="md:w-48">
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-900"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        {/* Boutons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={updateFilters}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-orange-300 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 