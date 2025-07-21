export function ErrorState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-red-600 mb-2">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Erreur lors du chargement
      </h3>
      <p className="text-gray-500">
        Impossible de charger les utilisateurs. Veuillez réessayer.
      </p>
    </div>
  )
} 