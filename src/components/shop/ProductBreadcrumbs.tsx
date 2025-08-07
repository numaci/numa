import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

interface ProductBreadcrumbsProps {
  categoryName: string;
  categorySlug: string;
  productName: string;
}

export default function ProductBreadcrumbs({
  categoryName,
  categorySlug,
  productName,
}: ProductBreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-black transition-colors duration-200"
      >
        Accueil
      </Link>
      
      <FaChevronRight className="text-gray-300" size={10} />
      
      <Link 
        href="/products" 
        className="text-gray-500 hover:text-black transition-colors duration-200"
      >
        Produits
      </Link>
      
      <FaChevronRight className="text-gray-300" size={10} />
      
      <Link 
        href={`/categories/${categorySlug}`} 
        className="text-gray-500 hover:text-black transition-colors duration-200"
      >
        {categoryName}
      </Link>
      
      <FaChevronRight className="text-gray-300" size={10} />
      
      <span className="text-black font-medium truncate max-w-[200px]">
        {productName}
      </span>
    </nav>
  );
}