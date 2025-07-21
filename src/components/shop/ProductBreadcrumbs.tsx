import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

interface ProductBreadcrumbsProps {
  categoryName: string;
  categorySlug: string;
  productName: string;
}

export default function ProductBreadcrumbs({ 
  categoryName, 
  categorySlug, 
  productName 
}: ProductBreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        href="/" 
        className="flex items-center space-x-1 hover:text-amber-600 transition-colors"
      >
        <FaHome size={14} />
        <span>Accueil</span>
      </Link>
      
      <FaChevronRight size={12} />
      
      <Link 
        href="/products" 
        className="hover:text-amber-600 transition-colors"
      >
        Produits
      </Link>
      
      <FaChevronRight size={12} />
      
      <Link 
        href={`/products?category=${categorySlug}`}
        className="hover:text-amber-600 transition-colors"
      >
        {categoryName}
      </Link>
      
      <FaChevronRight size={12} />
      
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {productName}
      </span>
    </nav>
  );
} 