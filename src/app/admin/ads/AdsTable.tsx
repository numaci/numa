"use client";

import Image from 'next/image';
import { Ad } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

interface AdsTableProps {
  ads: Ad[];
  onDelete: (id: string) => void;
}

export default function AdsTable({ ads, onDelete }: AdsTableProps) {
  if (ads.length === 0) {
    return <p className="text-center text-gray-500">Aucune publicité à afficher.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lien</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ads.map((ad) => (
            <tr key={ad.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {ad.imageUrl ? (
                  <Image
                    src={ad.imageUrl} // The path is relative to the `public` folder
                    alt="Image de la publicité"
                    width={100}
                    height={50}
                    className="object-cover rounded-md"
                  />
                ) : (
                  <span className="text-gray-400">Pas d'image</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ad.link ? (
                  <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {ad.link}
                  </a>
                ) : (
                  <span className="text-gray-500">Aucun lien</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ad.isActive ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="destructive" size="sm" onClick={() => onDelete(ad.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}