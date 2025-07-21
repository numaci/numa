"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Ad {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  imageUrl?: string | null;
  link?: string | null;
  bgColor?: string | null;
}

export default function ProductsCarousel({ ads }: { ads: Ad[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [ads]);

  if (!ads || ads.length === 0) return null;

  const ad = ads[index];

  return (
    <section
      className={`w-full rounded-lg shadow p-6 mb-8 flex flex-col items-center text-center transition-all duration-500`}
      style={{ background: ad.bgColor || "#fff" }}
    >
      <h2 className="text-2xl font-bold mb-2">{ad.title}</h2>
      <p className="mb-4 text-gray-600">{ad.description}</p>
      {ad.link ? (
        <a href={ad.link}>
          <button className="bg-gray-700 text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition">
            {ad.buttonText}
          </button>
        </a>
      ) : (
        <button className="bg-gray-700 text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition">
          {ad.buttonText}
        </button>
      )}
      {ad.imageUrl && (
        <Image src={ad.imageUrl} alt={ad.title} width={128} height={128} className="mt-4 max-h-32 object-contain" />
      )}
      <div className="flex gap-2 mt-4 justify-center">
        {ads.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-gray-700" : "bg-gray-300"}`}
            style={{ display: "inline-block" }}
          />
        ))}
      </div>
    </section>
  );
} 