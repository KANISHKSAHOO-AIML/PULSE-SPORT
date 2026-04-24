"use client";
import { useState } from "react";

interface TeamLogoProps {
  src?: string;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
}

export default function TeamLogo({ src, alt, fallback, className = "w-full h-full object-contain p-1" }: TeamLogoProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
}
