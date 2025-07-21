"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";

export default function ClientTransitionWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && <PageLoader />}
      <div className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>
        {children}
      </div>
    </>
  );
} 