"use client";

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
}

interface AddressFormProps {
  address: Address;
  onAddressChange: (address: Address) => void;
}

export default function AddressForm({ address, onAddressChange }: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string) => {
    onAddressChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            value={address.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            value={address.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse *
        </label>
        <input
          type="text"
          value={address.address1}
          onChange={(e) => handleChange("address1", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123 Rue de la Paix"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Complément d'adresse (optionnel)
        </label>
        <input
          type="text"
          value={address.address2 || ""}
          onChange={(e) => handleChange("address2", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Appartement, bureau, etc."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville *
          </label>
          <select
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner une ville</option>
            <option value="Sikasso">Sikasso</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Livraison disponible uniquement à Sikasso
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pays *
          </label>
          <input
            type="text"
            value="Mali"
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          value={address.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+223 012345678"
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">Zone de livraison</h4>
        <p className="text-sm text-blue-700">
          La livraison est actuellement disponible uniquement dans la ville de Sikasso, Mali.
          Pour toute autre localisation, veuillez nous contacter.
        </p>
      </div>
    </div>
  );
} 