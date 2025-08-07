"use client";

import { useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa";

interface ProductDetailImagesProps {
  product: {
    name: string;
    imageUrl: string | null;
    images: string | null;
    price: number;
    comparePrice: number | null;
    isFeatured: boolean;
  };
}

export default function ProductDetailImages({ product }: ProductDetailImagesProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction utilitaire pour parser les images en toute sécurité
  function getImagesArray(images: string | null): string[] {
    if (!images) return [];
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const imagesArray = getImagesArray(product.images);
  const allImages = product.imageUrl 
    ? [product.imageUrl, ...imagesArray]
    : imagesArray;

  // Calcul du pourcentage de réduction
  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  if (allImages.length === 0) {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
        <span className="text-gray-300 text-6xl">📦</span>
      </div>
    );
  }

  return (
    <>
      {/* Image principale */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm group border border-gray-200">
        <Image
          src={allImages[selectedImageIndex]}
          alt={`${product.name} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Bouton zoom */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <FaExpand size={16} />
        </button>

        {/* Boutons navigation */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FaChevronRight size={16} />
            </button>
          </>
        )}

        {/* Badge de réduction */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-black text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Badge "En vedette" */}
        {/* {product.isFeatured && (
          <div className="absolute top-4 left-16 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
            ⭐ Vedette
          </div>
        )} */}


      </div>

      {/* Galerie d'images */}
      {allImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square relative overflow-hidden rounded-lg bg-white border transition-all duration-200 ${
                index === selectedImageIndex
                  ? "ring-1 ring-black border-black"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal pour zoom */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={allImages[selectedImageIndex]}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              width={800}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            
            {/* Boutons navigation dans le modal */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <FaChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}