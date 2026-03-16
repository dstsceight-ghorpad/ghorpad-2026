import { samplePersonnel } from "./sample-data";
import type { Personnel } from "@/types";

const PERSONNEL_EDITS_KEY = "ghorpad_personnel_edits";

// All known rank abbreviations (longest first so "Lt Col" matches before "Lt")
const RANK_PREFIXES = [
  "Gp Capt(TS)", "Col(TS)", "Capt(IN)", "Rear Admiral",
  "Gp Capt", "Lt Col", "Lt Cdr", "Wg Cdr", "Sqn Ldr",
  "Dy Comdt", "Brigadier", "Colonel",
  "Major", "Capt", "Col", "Cdr", "Brig", "Maj", "Lt",
  "R Adm", "Surg Cdr", "Surg Lt Cdr",
];

/**
 * Returns the display name as "Rank Name".
 * If the name already starts with the rank, returns the name as-is.
 * If the name doesn't include the rank, prepends it.
 */
export function getDisplayName(person: { name: string; rank: string }): string {
  // If name already starts with the rank abbreviation, return as-is
  if (person.name.startsWith(person.rank + " ")) return person.name;
  // Otherwise prepend rank
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

type PersonnelEdits = Record<string, Partial<Personnel>>;

// ─── Load personnel with localStorage edits merged ───────────────────────────

export function loadPersonnel(): Personnel[] {
  if (typeof window === "undefined") return samplePersonnel;
  const raw = localStorage.getItem(PERSONNEL_EDITS_KEY);
  if (!raw) return samplePersonnel;
  try {
    const edits: PersonnelEdits = JSON.parse(raw);
    return samplePersonnel.map((p) =>
      edits[p.id] ? { ...p, ...edits[p.id] } : p
    );
  } catch {
    return samplePersonnel;
  }
}

// ─── Save a single personnel edit to localStorage ────────────────────────────

export function savePersonnelEdit(
  id: string,
  updates: Partial<Personnel>
): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(PERSONNEL_EDITS_KEY);
  const edits: PersonnelEdits = raw ? JSON.parse(raw) : {};
  edits[id] = { ...(edits[id] || {}), ...updates };
  localStorage.setItem(PERSONNEL_EDITS_KEY, JSON.stringify(edits));
}

// ─── Resize and convert image to base64 data URL ─────────────────────────────

export function resizeAndConvertToBase64(
  file: File,
  maxWidth = 400,
  maxHeight = 500,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Scale down if larger than max
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
