import { User, Shield, Mail, Calendar, MapPin, Phone } from 'lucide-react'
import Image from "next/image";

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface UserDetailsProps {
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    image?: string | null;
    emailVerified?: Date | null;
    createdAt: Date | string;
    addresses?: Address[];
  }
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="admin-card">
      <h2 className="text-2xl font-bold text-black mb-6">
        Informations Personnelles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-300">
              {user.image ? (
                <Image src={user.image} alt="" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">
                {user.firstName || ''} {user.lastName || ''}
              </h3>
              <p className="text-gray-600">{user.email || user.phone || 'Aucun contact'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {user.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-gray-800">{user.email}</span>
              </div>
            )}
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <span className="text-gray-800">{user.phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800">
                Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {user.role === 'ADMIN' ? (
                <Shield className="h-5 w-5 text-red-600" />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
              <span className={`admin-status-badge ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.role === 'ADMIN' ? 'Administrateur' : 'Client'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`admin-status-badge ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-bold text-black text-lg">Adresses</h4>
          {user.addresses && user.addresses.length > 0 ? (
            <div className="space-y-4">
              {user.addresses.map((address: any) => (
                <div key={address.id} className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-black">
                      {address.type === 'SHIPPING' ? 'Livraison' : 'Facturation'}
                    </span>
                    {address.isDefault && (
                      <span className="admin-status-badge bg-black text-white text-xs">Par défaut</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{address.firstName} {address.lastName}</p>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>{address.postalCode} {address.city}</p>
                    <p>{address.country}</p>
                    {address.phone && <p>📞 {address.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Aucune adresse enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}