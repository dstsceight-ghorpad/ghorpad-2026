import type { Personnel } from "@/types";

export function getPhotoStatus(personnel: Personnel[]): {
  withPhoto: number;
  withoutPhoto: number;
  total: number;
  percentage: number;
} {
  const withPhoto = personnel.filter((p) => !!p.avatar_url).length;
  const total = personnel.length;
  return {
    withPhoto,
    withoutPhoto: total - withPhoto,
    total,
    percentage: total === 0 ? 0 : Math.round((withPhoto / total) * 100),
  };
}

export function getNextWithoutPhoto(
  personnel: Personnel[],
  currentId?: string
): Personnel | null {
  const missing = personnel.filter((p) => !p.avatar_url);
  if (missing.length === 0) return null;
  if (!currentId) return missing[0];
  const currentIndex = missing.findIndex((p) => p.id === currentId);
  if (currentIndex === -1 || currentIndex >= missing.length - 1) {
    return missing[0];
  }
  return missing[currentIndex + 1];
}
