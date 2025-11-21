"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";

export default function ClientTransitionWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAnimating(true);
    setLoading(true);
    
    // Transition plus rapide (200ms au lieu de 400ms)
    const loadingTimeout = setTimeout(() => setLoading(false), 150);
    
    // Animation d'entrée
    const animationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 250);

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(animationTimeout);
    };
  }, [pathname]);

  return (
    <>
      {loading && <PageLoader />}
      <div 
        className={`
          transition-all duration-200 ease-out
          ${loading ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"}
          ${isAnimating ? "translate-y-2" : "translate-y-0"}
        `}
        style={{
          transition: 'opacity 200ms ease-out, transform 200ms ease-out'
        }}
      >
        {children}
      </div>
    </>
  );
} 