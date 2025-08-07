"use client";

// Types pour les props du composant
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Composant de pagination
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Version mobile */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="admin-button admin-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="admin-button admin-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>

      {/* Version desktop */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Informations sur les résultats */}
        <div>
          <p className="text-sm text-gray-600 antialiased">
            Affichage de{" "}
            <span className="font-semibold text-black">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            à{" "}
            <span className="font-semibold text-black">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            sur <span className="font-semibold text-black">{totalItems}</span> résultats
          </p>
        </div>

        {/* Navigation des pages */}
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
            {/* Bouton précédent */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed antialiased transition-colors duration-200"
            >
              Précédent
            </button>

            {/* Numéros de pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium antialiased transition-colors duration-200 ${
                  currentPage === page
                    ? "z-10 bg-black border-black text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Bouton suivant */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed antialiased transition-colors duration-200"
            >
              Suivant
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
} 