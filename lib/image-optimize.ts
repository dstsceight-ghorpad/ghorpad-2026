import type { ImageOptimizeOptions, ImageOptimizeResult } from "@/types";

// ─── Presets ──────────────────────────────────────────────────

export const COVER_PRESET: ImageOptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: "webp",
};

export const AVATAR_PRESET: ImageOptimizeOptions = {
  maxWidth: 400,
  maxHeight: 500,
  quality: 0.7,
  format: "jpeg",
};

export const GALLERY_PRESET: ImageOptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 900,
  quality: 0.75,
  format: "webp",
};

// ─── WebP support detection ──────────────────────────────────

let webpSupported: boolean | null = null;

export function supportsWebP(): boolean {
  if (webpSupported !== null) return webpSupported;
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupported;
}

// ─── Main optimize function ─────────────────────────────────

export function optimizeImage(
  file: File,
  options: ImageOptimizeOptions = COVER_PRESET
): Promise<ImageOptimizeResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Scale down if needed
        if (w > options.maxWidth || h > options.maxHeight) {
          const ratio = Math.min(options.maxWidth / w, options.maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        // Determine output format
        let mimeType = `image/${options.format}`;
        if (options.format === "webp" && !supportsWebP()) {
          mimeType = "image/jpeg"; // fallback
        }

        const dataUrl = canvas.toDataURL(mimeType, options.quality);

        // Estimate optimized size from base64 length
        const base64Data = dataUrl.split(",")[1] || "";
        const optimizedSize = Math.round((base64Data.length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          optimizedSize,
          width: w,
          height: h,
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
