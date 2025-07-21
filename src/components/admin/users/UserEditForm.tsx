'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User, Shield, Mail, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from "next/image"

interface UserEditFormProps {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    role: 'USER' | 'ADMIN'
    emailVerified: Date | null
    createdAt: Date
  }
}

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    emailVerified: !!user.emailVerified
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          emailVerified: formData.emailVerified
        }),
      })

      if (response.ok) {
        router.push(`/admin/users/${user.id}`)
        router.refresh()
      } else {
        alert('Erreur lors de la modification')
      }
    } catch (error) {
      alert('Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            {user.image ? (
              <Image src={user.image} alt="" width={48} height={48} className="h-12 w-12 rounded-full" />
            ) : (
              <User className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <Link
          href={`/admin/users/${user.id}`}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Prénom"
            />
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nom"
            />
          </div>

          {/* Email (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          {/* Rôle */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Statut de vérification email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut Email
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Email vérifié</span>
              </label>
            </div>
          </div>

          {/* Date d'inscription (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'inscription
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Informations actuelles */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Informations actuelles</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {formData.role === 'ADMIN' ? (
                <Shield className="h-4 w-4 text-red-400" />
              ) : (
                <User className="h-4 w-4 text-gray-400" />
              )}
              <Badge variant={formData.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                {formData.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={formData.emailVerified ? 'default' : 'secondary'}>
                {formData.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link
            href={`/admin/users/${user.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annuler
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
} 