"use client";
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Eye, Edit, Trash2, User, Shield, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/admin/users/Pagination';
import { DeleteModal } from '@/components/admin/users/DeleteModal';

export function UserTableClient({ users, totalUsers, page, search, role, status, totalPages }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-visible z-0">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-white rounded-t-2xl">
        <h3 className="text-lg font-bold text-orange-700">
          Utilisateurs ({totalUsers})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-100 text-sm md:text-base">
          <thead className="bg-gradient-to-r from-amber-100 via-orange-50 to-white">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tl-2xl whitespace-nowrap">Utilisateur</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Rôle</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Statut</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Commandes</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-orange-600 uppercase tracking-wider whitespace-nowrap">Date d'inscription</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-orange-600 uppercase tracking-wider rounded-tr-2xl whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 divide-y divide-orange-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-orange-50/60 transition">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        {user.image ? (
                          <img
                            className="h-10 w-10 rounded-xl object-cover shadow border border-orange-100"
                            src={user.image}
                            alt=""
                          />
                        ) : (
                          <User className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-orange-800">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-orange-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}
                    className="inline-flex items-center"
                  >
                    {user.role === 'ADMIN' ? (
                      <Shield className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                  </Badge>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={user.emailVerified ? 'default' : 'secondary'}
                  >
                    {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                  </Badge>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-900 font-semibold">
                  {user._count.orders} commande{user._count.orders !== 1 ? 's' : ''}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-orange-500">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative flex justify-end">
                    <button
                      className="p-2 rounded-full bg-white/10 hover:bg-orange-100 text-orange-600 hover:text-orange-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
                      title="Actions"
                      onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === user.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-t-xl transition"
                          onClick={() => { window.location.href = `/admin/users/${user.id}`; setOpenMenu(null); }}
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 transition"
                          onClick={() => { window.location.href = `/admin/users/${user.id}/edit`; setOpenMenu(null); }}
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-xl transition"
                          onClick={() => { setOpenMenu(null); setShowDelete(user.id); }}
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
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
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-orange-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchParams={{ search, role, status }}
          />
        </div>
      )}
    </div>
  );
} 