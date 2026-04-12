/**
 * Supabase Pro Plan image transform helper.
 * Appends resize/quality params to storage URLs for on-the-fly optimization.
 * Original HD file is always served when no params are added.
 */

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "contain" | "cover" | "fill";
}

/** Presets for common use cases */
export const IMAGE_PRESETS = {
  /** Gallery grid thumbnail — small, fast loading */
  galleryThumb: { width: 600, quality: 70 } as TransformOptions,
  /** Gallery card hover — medium quality */
  galleryCard: { width: 800, quality: 75 } as TransformOptions,
  /** Lightbox full-screen — high quality */
  lightbox: { width: 1600, quality: 85 } as TransformOptions,
  /** Personnel avatar in grid */
  avatar: { width: 400, height: 500, quality: 80 } as TransformOptions,
  /** Personnel detail overlay — larger */
  avatarLarge: { width: 800, height: 1000, quality: 85 } as TransformOptions,
  /** Article cover image */
  articleCover: { width: 1200, quality: 80 } as TransformOptions,
};

/**
 * Append Supabase image transform params to a storage URL.
 * Only applies to Supabase storage URLs — passes through external URLs unchanged.
 * Returns the original URL with no params for HD download.
 */
export function getTransformedUrl(
  url: string | null | undefined,
  opts?: TransformOptions
): string {
  if (!url) return "";
  // Only transform Supabase storage URLs
  if (!url.includes("supabase.co/storage/v1/object/public/")) return url;
  if (!opts) return url; // No transform = original HD

  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("resize", opts.resize || "contain");
  params.set("quality", String(opts.quality || 75));

  // Strip existing query params if any
  const baseUrl = url.split("?")[0];
  return `${baseUrl}?${params.toString()}`;
}

/** Get the original HD URL (strips any transform params) */
export function getHdUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.split("?")[0];
}
