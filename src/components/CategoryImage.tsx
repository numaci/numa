"use client";
import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

export default function CategoryImage({ src, alt, className }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Image
      src={imgError || !src ? "/placeholder.png" : src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      onError={() => setImgError(true)}
      priority={false}
      unoptimized={false}
    />
  );
} 