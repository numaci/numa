"use client";
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Eye, Edit, Trash2, User, Shield, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/admin/users/Pagination';
import { DeleteModal } from '@/components/admin/users/DeleteModal';

export function UserTableClient({ users, totalUsers, page, totalPages }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header du tableau */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 antialiased">
            📈 Liste des clients ({totalUsers})
          </h3>
          <div className="text-sm text-gray-600 antialiased">
            {totalUsers === 0 ? 'Aucun client' : `${totalUsers} client${totalUsers > 1 ? 's' : ''} au total`}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Type de compte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Commandes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Inscription
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider antialiased">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {user.image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.image}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 antialiased">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 antialiased">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium antialiased ${
                    user.role === 'ADMIN' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'ADMIN' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        🔑 Administrateur
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        🛍️ Client
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium antialiased ${
                    user.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.emailVerified ? '✅ Actif' : '❌ Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 antialiased">
                  <div className="flex items-center">
                    <span className="font-medium">{user._count.orders}</span>
                    <span className="ml-1 text-gray-500">
                      commande{user._count.orders !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 antialiased">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative flex justify-end">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      title="Actions"
                      onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === user.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 antialiased"
                          onClick={() => setOpenMenu(null)}
                        >
                          <Eye className="w-4 h-4" /> 
                          Voir le profil
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 antialiased"
                          onClick={() => setOpenMenu(null)}
                        >
                          <Edit className="w-4 h-4" /> 
                          Modifier
                        </Link>
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 antialiased"
                          onClick={() => { setOpenMenu(null); setShowDelete(user.id); }}
                        >
                          <Trash2 className="w-4 h-4" /> 
                          Supprimer
                        </button>
                      </div>
                    )}
                    {/* DeleteModal pour chaque utilisateur */}
                    {showDelete === user.id && (
                      <DeleteModal userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchParams={{}}
          />
        </div>
      )}
      
      {/* Message si aucun utilisateur */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 antialiased">Aucun client trouvé</h3>
          <p className="mt-1 text-sm text-gray-500 antialiased">
            Votre boutique n'a pas encore de clients inscrits.
          </p>
        </div>
      )}
    </div>
  );
}