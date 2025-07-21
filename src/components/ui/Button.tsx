import { cn } from '@/lib/utils'

// Interface TypeScript pour les propriétés du composant Button
// Étend les propriétés HTML natives du bouton avec des props personnalisées
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' // Style visuel du bouton
  size?: 'sm' | 'md' | 'lg' // Taille du bouton
}

// Composant Button réutilisable avec plusieurs variantes et tailles
// Utilise Tailwind CSS pour le styling et supporte toutes les props HTML natives
export function Button({ 
  children,        // Contenu du bouton (texte, icône, etc.)
  variant = 'default', // Variante de style (par défaut: primary)
  size = 'md',     // Taille du bouton (par défaut: medium)
  className,       // Classes CSS supplémentaires
  ...props         // Toutes les autres props HTML (onClick, disabled, etc.)
}: ButtonProps) {
  // Classes CSS de base communes à tous les boutons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Classes CSS spécifiques à chaque variante de style
  const variantClasses = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',     // Bouton principal (bleu)
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',         // Bouton secondaire (gris)
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',          // Bouton destructeur (rouge)
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500' // Bouton contouré
  }
  
  // Classes CSS spécifiques à chaque taille
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',    // Petite taille
    md: 'px-4 py-2 text-sm',      // Taille moyenne (par défaut)
    lg: 'px-6 py-3 text-base'     // Grande taille
  }

  return (
    <button 
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      // cn() combine toutes les classes CSS :
      // - Classes de base communes
      // - Classes de la variante sélectionnée
      // - Classes de la taille sélectionnée
      // - Classes personnalisées passées en prop
      {...props} // Spread de toutes les props HTML natives
    >
      {children} {/* Contenu du bouton */}
    </button>
  )
} 