import Image from "next/image";

// Interface pour les props des images
interface ProductImagesProps {
  product: {
    name: string;
    imageUrl: string | null;
    images: string | null;
    isFeatured: boolean;
    comparePrice: number | null;
    price: number;
  };
}

// Composant d'affichage des images d'un produit
export default function ProductImages({ product }: ProductImagesProps) {
  // Calcul du pourcentage de réduction
  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

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

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-6xl">📦</span>
          </div>
        )}
        
        {/* Badge de réduction */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Badge "En vedette" */}
        {/* {product.isFeatured && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
            ⭐ Vedette
          </div>
        )} */}
      </div>

      {/* Images multiples (si disponibles) */}
      {imagesArray.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {imagesArray.map((image, index) => (
            <div key={index} className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 shadow cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 