'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from 'next/link';

// This interface now matches the simplified Ad model from Prisma
interface Ad {
  id: string;
  imageUrl: string | null;
  link?: string | null;
}

interface AdBannerCarouselProps {
  ads: Ad[];
}

const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

// A helper component to render a link only if href is provided
const ConditionalLink = ({ href, children, className }: { href?: string, children: React.ReactNode, className?: string }) => {
  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
    }
    return <Link href={href} className={className}>{children}</Link>;
  }
  return <div className={className}>{children}</div>;
};

const AdBannerCarousel: React.FC<AdBannerCarouselProps> = ({ ads }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filter out ads without a valid image URL right away
  const visibleAds = ads.filter(ad => ad.imageUrl);

  useEffect(() => {
    if (visibleAds.length <= 1) return;

    const nextSlide = () => {
      setCurrent((prev) => (prev === visibleAds.length - 1 ? 0 : prev + 1));
    };

    timeoutRef.current = setTimeout(nextSlide, AUTO_SCROLL_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current, visibleAds.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrent(slideIndex);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const prevSlide = () => {
    const newIndex = current === 0 ? visibleAds.length - 1 : current - 1;
    goToSlide(newIndex);
  };

  const nextSlide = () => {
    const newIndex = current === visibleAds.length - 1 ? 0 : current + 1;
    goToSlide(newIndex);
  };

  if (visibleAds.length === 0) {
    return null; // Don't render anything if there are no ads with images
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-8 rounded-lg overflow-hidden shadow-lg bg-gray-100" style={{ height: 'clamp(240px, 38vw, 400px)' }}>
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex transition-transform ease-out duration-500 h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {visibleAds.map((ad) => (
            <div key={ad.id} className="w-full h-full flex-shrink-0 relative">
              <ConditionalLink href={ad.link || undefined} className="block w-full h-full">
                <Image
                  src={ad.imageUrl!} // We've filtered out nulls, so we can assert it's a string
                  alt="Publicité"
                  fill
                  className="object-contain"
                  priority={visibleAds.indexOf(ad) === 0} // Priority load for the first image
                />
              </ConditionalLink>
            </div>
          ))}
        </div>
      </div>

      {visibleAds.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-20" aria-label="Précédent">
            &#8592;
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-20" aria-label="Suivant">
            &#8594;
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {visibleAds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
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