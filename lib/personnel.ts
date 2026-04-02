import type { Personnel } from "@/types";

// All known rank abbreviations (longest first so "Lt Col" matches before "Lt")
const RANK_PREFIXES = [
  "Gp Capt(TS)", "Col(TS)", "Capt(IN)", "Rear Admiral",
  "Gp Capt", "Lt Col", "Lt Cdr", "Wg Cdr", "Sqn Ldr",
  "Comdt (JG)", "Dy Comdt", "Brigadier", "Colonel",
  "Major", "Capt", "Col", "Cdr", "Brig", "Maj", "Lt",
  "R Adm", "Surg Cdr", "Surg Lt Cdr",
];

/**
 * Returns the display name as "Rank Name".
 * If the name already starts with the rank, returns the name as-is.
 * If the name doesn't include the rank, prepends it.
 */
export function getDisplayName(person: { name: string; rank: string }): string {
  if (person.name.startsWith(person.rank + " ")) return person.name;
  return `${person.rank} ${person.name}`;
}

/**
 * Strips the rank prefix from a name string, returning just the name.
 */
export function stripRankFromName(name: string): string {
  for (const prefix of RANK_PREFIXES) {
    if (name.startsWith(prefix + " ")) {
      return name.slice(prefix.length + 1);
    }
  }
  return name;
}

// ─── Resize and convert image to base64 data URL ─────────────────────────────

export function resizeAndConvertToBase64(
  file: File,
  maxWidth = 1200,
  maxHeight = 1500,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
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
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
