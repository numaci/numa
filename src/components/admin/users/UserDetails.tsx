import { Badge } from '@/components/ui/Badge'
import { User, Shield, Mail, Calendar, MapPin } from 'lucide-react'
import Image from "next/image";

interface UserDetailsProps {
  user: Record<string, unknown>
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8">
      <h2 className="text-2xl font-extrabold text-orange-700 mb-4">
        Informations Personnelles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shadow border border-orange-100">
              {user.image ? (
                <Image src={user.image} alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <User className="h-6 w-6 text-orange-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-800">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-orange-400">{user.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-700">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-700">
                Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {user.role === 'ADMIN' ? (
                <Shield className="h-4 w-4 text-red-400" />
              ) : (
                <User className="h-4 w-4 text-orange-400" />
              )}
              <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-orange-800">Adresses</h4>
          {user.addresses && user.addresses.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((address: any) => (
                <div key={address.id} className="p-4 border border-orange-100 rounded-xl bg-orange-50/40">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-700">
                      {address.type === 'SHIPPING' ? 'Livraison' : 'Facturation'}
                    </span>
                    {address.isDefault && (
                      <Badge variant="outline" className="text-xs">Par défaut</Badge>
                    )}
                  </div>
                  <div className="text-sm text-orange-700">
                    <p>{address.firstName} {address.lastName}</p>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>{address.postalCode} {address.city}</p>
                    <p>{address.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-orange-400">Aucune adresse enregistrée</p>
          )}
        </div>
      </div>
    </div>
  )
} 