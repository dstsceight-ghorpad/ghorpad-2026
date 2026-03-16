"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface PersonnelAvatarProps {
  src: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
  iconLabel?: string;
}

/**
 * Renders a personnel photo with graceful fallback.
 * If the image URL returns 404 (not uploaded yet), shows a placeholder icon.
 */
export default function PersonnelAvatar({
  src,
  alt,
  className = "w-full h-full object-cover",
  iconSize = 32,
  iconLabel,
}: PersonnelAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <User size={iconSize} className="text-muted/30" />
        {iconLabel && (
          <span className="font-mono text-[10px] text-muted mt-2">
            {iconLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
