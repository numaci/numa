'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string>
}

export function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `/admin/users?${params.toString()}`
  }

  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Page {currentPage} sur {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Link>
        )}
        
        {pages.map((page) => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
              page === currentPage
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {page}
          </Link>
        ))}
        
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
} 