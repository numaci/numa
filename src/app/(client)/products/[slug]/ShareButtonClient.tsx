"use client";
import { useCallback } from "react";
import { FaShareAlt } from "react-icons/fa";

export default function ShareButtonClient({ productName }: { productName: string }) {
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: productName,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  }, [productName]);

  return (
    <button
      type="button"
      className="ml-2 p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 sm:hidden"
      aria-label="Partager"
      onClick={handleShare}
    >
      <FaShareAlt size={20} />
    </button>
  );
} 