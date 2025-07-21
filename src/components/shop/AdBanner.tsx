"use client";
import { useState } from "react";
import Image from "next/image";
import placeholder from "@/../public/placeholder.png";

export default function AdBanner({ imageUrl, alt, link, bgColor, title }) {
  const [imgSrc, setImgSrc] = useState(imageUrl || placeholder);

  return (
    <div className="w-full mb-1 rounded-none overflow-hidden shadow-lg">
      <a
        href={link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        style={{ background: bgColor || "#f5f5f5" }}
      >
        <Image
          src={imgSrc}
          alt={alt || title || "Publicité"}
          width={1200}
          height={320}
          className="w-full object-cover"
          style={{ maxHeight: 320, width: "100%" }}
          priority
          onError={() => setImgSrc(placeholder)}
        />
      </a>
    </div>
  );
} 