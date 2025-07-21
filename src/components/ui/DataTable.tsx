"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// Types pour le tableau de données
export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface Action<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    field: keyof T;
    direction: "asc" | "desc";
    onSort: (field: keyof T) => void;
  };
  emptyMessage?: string;
  className?: string;
}

// Composant de tableau de données
export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  loading = false,
  error = null,
  pagination,
  sorting,
  emptyMessage = "Aucune donnée disponible",
  className = "",
}: DataTableProps<T>) {
  // État pour la sélection multiple
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Gestion de la sélection
  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Rendu du contenu d'une cellule
  const renderCell = (column: Column<T>, item: T) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }

    // Rendu par défaut selon le type de données
    if (typeof value === "boolean") {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value ? "Oui" : "Non"}
        </span>
      );
    }

    if (typeof value === "number") {
      return value.toLocaleString("fr-FR");
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("fr-FR");
    }

    return value?.toString() || "-";
  };

  // Rendu de l'en-tête de tri
  const renderSortHeader = (column: Column<T>) => {
    if (!column.sortable || !sorting) {
      return column.label;
    }

    const isSorted = sorting.field === column.key;
    const isAsc = sorting.direction === "asc";

    return (
      <button
        onClick={() => sorting.onSort(column.key)}
        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
      >
        <span>{column.label}</span>
        {isSorted ? (
          isAsc ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        ) : (
          <div className="w-4 h-4 opacity-0 group-hover:opacity-50">
            <ChevronUp className="w-4 h-4" />
          </div>
        )}
      </button>
    );
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-visible">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-visible">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-visible ${className}`}>
      {/* Tableau */}
      <div className="overflow-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox pour sélection multiple */}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {/* Colonnes */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? column.width : ""
                  } ${
                    column.align === "center" ? "text-center" : 
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {renderSortHeader(column)}
                </th>
              ))}
              
              {/* Colonne des actions */}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-1">Aucune donnée</p>
                    <p className="text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Checkbox pour sélection */}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {/* Cellules de données */}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.align === "center" ? "text-center" : 
                        column.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {renderCell(column, item)}
                    </td>
                  ))}
                  
                  {/* Actions */}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {actions.map((action, index) => {
                          const isDisabled = action.disabled ? action.disabled(item) : false;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => !isDisabled && action.onClick(item)}
                              disabled={isDisabled}
                              className={`
                                inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded
                                focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${
                                  action.variant === "danger"
                                    ? "text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500"
                                    : action.variant === "secondary"
                                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500"
                                    : "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500"
                                }
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                              `}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          {/* Informations sur les résultats */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                à{" "}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{" "}
                sur <span className="font-medium">{pagination.totalItems}</span> résultats
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {/* Bouton précédent */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Pages */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {/* Bouton suivant */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 