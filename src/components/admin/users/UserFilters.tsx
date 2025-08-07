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
    <div className="mb-6">
      {/* Titre de section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 antialiased">🔍 Rechercher et filtrer les clients</h2>
        <p className="text-sm text-gray-600 antialiased">Trouvez rapidement vos clients par nom, email ou statut</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
              Recherche globale
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nom, prénom, email du client..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && updateFilters()}
                className="admin-input pl-10"
              />
            </div>
          </div>
          
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtre Rôle */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
                Type de compte
              </label>
              <select
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value)}
                className="admin-input"
              >
                <option value="">Tous les types</option>
                <option value="USER">🛍️ Client</option>
                <option value="ADMIN">🔑 Administrateur</option>
              </select>
            </div>
            
            {/* Filtre Statut */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2 antialiased">
                Statut du compte
              </label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="admin-input"
              >
                <option value="">Tous les statuts</option>
                <option value="active">✅ Actif</option>
                <option value="inactive">❌ Inactif</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 antialiased">
            {hasActiveFilters ? (
              <span>📊 Filtres actifs appliqués</span>
            ) : (
              <span>Aucun filtre appliqué</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="admin-button-secondary"
              >
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </button>
            )}
            <button
              onClick={updateFilters}
              className="admin-button-primary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}