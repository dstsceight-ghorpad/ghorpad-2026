"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { getTransformedUrl, IMAGE_PRESETS, type TransformOptions } from "@/lib/image-url";

interface PersonnelAvatarProps {
  src: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
  iconLabel?: string;
  /** Image transform preset — defaults to avatar (400x500) */
  transform?: TransformOptions;
}

/**
 * Renders a personnel photo with graceful fallback.
 * Uses Supabase image transforms for optimized delivery.
 * If the image URL returns 404 (not uploaded yet), shows a placeholder icon.
 */
export default function PersonnelAvatar({
  src,
  alt,
  className = "w-full h-full object-cover object-top",
  iconSize = 32,
  iconLabel,
  transform = IMAGE_PRESETS.avatar,
}: PersonnelAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <User size={iconSize} className="text-muted/50" />
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
      src={getTransformedUrl(src, transform)}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
