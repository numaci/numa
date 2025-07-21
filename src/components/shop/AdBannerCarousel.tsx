'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Ad {
  id: string | number;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  bgColor?: string;
  productId?: string;
  productSlug?: string;
  categoryId?: string;
  categorySlug?: string;
}

interface AdBannerCarouselProps {
  ads: Ad[];
}

const AUTO_SCROLL_INTERVAL = 5000; // 5s

const AdBannerCarousel: React.FC<AdBannerCarouselProps> = ({ ads }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibleAds = ads.slice(0, 4);
  const [imgError, setImgError] = useState<{[key:string]:boolean}>({});

  useEffect(() => {
    if (visibleAds.length <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % visibleAds.length);
    }, AUTO_SCROLL_INTERVAL);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, visibleAds.length]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const prev = () => goTo((current - 1 + visibleAds.length) % visibleAds.length);
  const next = () => goTo((current + 1) % visibleAds.length);

  if (visibleAds.length === 0) return null;

  return (
    <div
      className="relative w-full max-w-6xl mx-auto mb-8 rounded-lg overflow-hidden shadow-lg"
      style={{ minHeight: 240, height: 'clamp(240px, 38vw, 400px)', background: visibleAds[current].bgColor || '#f5f5f5' }}
    >
      {visibleAds.map((ad, idx) => (
        <div
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-700 flex ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          style={{ background: ad.bgColor || "#f5f5f5", width: '100%', height: '100%' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {(() => {
              // Détermine le lien de redirection
              let href: string | undefined;
              if (ad.productId && ad.productSlug) {
                href = `/products/${ad.productSlug}`;
              } else if (ad.categoryId && ad.categorySlug) {
                href = `/products/category/${ad.categorySlug}`;
              } else if (ad.link) {
                href = ad.link;
              }
              const content = ad.imageUrl && !imgError[ad.id] ? (
                <Image
                  src={ad.imageUrl}
                  alt={ad.title || "Publicité"}
                  fill
                  className="object-contain w-full h-full cursor-pointer"
                  priority={idx === current}
                  onError={() => setImgError(e => ({ ...e, [ad.id]: true }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <span className="text-6xl mb-2">🚚</span>
                </div>
              );
              return href ? (
                <a href={href} target={ad.link && ad.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="w-full h-full block">
                  {content}
                </a>
              ) : content;
            })()}
          </div>
        </div>
      ))}
      {/* Contrôles */}
      {visibleAds.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-20"
            aria-label="Précédent"
          >
            &#8592;
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-20"
            aria-label="Suivant"
          >
            &#8594;
          </button>
          {/* Indicateurs */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {visibleAds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-3 h-3 rounded-full border border-white ${idx === current ? "bg-amber-500" : "bg-white/60"}`}
                aria-label={`Aller à la pub ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdBannerCarousel; 