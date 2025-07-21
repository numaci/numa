"use client";
import { useRef, useEffect, useState } from "react";

export default function CustomHorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);
  const [barLeft, setBarLeft] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function updateBar() {
      const visible = el.offsetWidth;
      const total = el.scrollWidth;
      const scroll = el.scrollLeft;
      const width = Math.max((visible / total) * visible, 40);
      const left = (scroll / total) * visible;
      setBarWidth(width);
      setBarLeft(left);
    }
    updateBar();
    el.addEventListener("scroll", updateBar);
    window.addEventListener("resize", updateBar);
    return () => {
      el.removeEventListener("scroll", updateBar);
      window.removeEventListener("resize", updateBar);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide pb-2 -mx-2 sm:mx-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
      {/* Custom scrollbar visible uniquement sur mobile */}
      <div className="block sm:hidden h-2 mt-1 w-full bg-gray-100 rounded-full relative">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-200"
          style={{ width: barWidth, left: barLeft }}
        />
      </div>
    </div>
  );
} 