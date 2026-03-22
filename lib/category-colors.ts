/**
 * Category-specific accent colour palette
 * Each category gets a unique hue for badges, borders, and accents.
 */

export interface CategoryColor {
  /** Tailwind bg class for badges */
  bg: string;
  /** Tailwind text class */
  text: string;
  /** Tailwind border class */
  border: string;
  /** Tailwind bg with opacity for hover/glow effects */
  bgGlow: string;
  /** Tailwind text on dark background */
  textOnDark: string;
  /** CSS hex for inline / dynamic styles */
  hex: string;
}

const palette: Record<string, CategoryColor> = {
  campus: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500/40",
    bgGlow: "bg-blue-500/10",
    textOnDark: "text-blue-400",
    hex: "#3b82f6",
  },
  achievements: {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500/40",
    bgGlow: "bg-emerald-500/10",
    textOnDark: "text-emerald-400",
    hex: "#10b981",
  },
  opinion: {
    bg: "bg-violet-500",
    text: "text-violet-500",
    border: "border-violet-500/40",
    bgGlow: "bg-violet-500/10",
    textOnDark: "text-violet-400",
    hex: "#8b5cf6",
  },
  sports: {
    bg: "bg-teal-500",
    text: "text-teal-500",
    border: "border-teal-500/40",
    bgGlow: "bg-teal-500/10",
    textOnDark: "text-teal-400",
    hex: "#14b8a6",
  },
  culture: {
    bg: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500/40",
    bgGlow: "bg-amber-500/10",
    textOnDark: "text-amber-400",
    hex: "#f59e0b",
  },
  tech: {
    bg: "bg-cyan-500",
    text: "text-cyan-500",
    border: "border-cyan-500/40",
    bgGlow: "bg-cyan-500/10",
    textOnDark: "text-cyan-400",
    hex: "#06b6d4",
  },
  leadership: {
    bg: "bg-gold",
    text: "text-gold",
    border: "border-gold/40",
    bgGlow: "bg-gold/10",
    textOnDark: "text-gold",
    hex: "#e8c84a",
  },
  media: {
    bg: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500/40",
    bgGlow: "bg-rose-500/10",
    textOnDark: "text-rose-400",
    hex: "#f43f5e",
  },
  poems: {
    bg: "bg-pink-500",
    text: "text-pink-500",
    border: "border-pink-500/40",
    bgGlow: "bg-pink-500/10",
    textOnDark: "text-pink-400",
    hex: "#ec4899",
  },
  "sketches & paintings": {
    bg: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-500/40",
    bgGlow: "bg-orange-500/10",
    textOnDark: "text-orange-400",
    hex: "#f97316",
  },
  "ladies corner": {
    bg: "bg-fuchsia-500",
    text: "text-fuchsia-500",
    border: "border-fuchsia-500/40",
    bgGlow: "bg-fuchsia-500/10",
    textOnDark: "text-fuchsia-400",
    hex: "#d946ef",
  },
  "international perspectives": {
    bg: "bg-indigo-500",
    text: "text-indigo-500",
    border: "border-indigo-500/40",
    bgGlow: "bg-indigo-500/10",
    textOnDark: "text-indigo-400",
    hex: "#6366f1",
  },
  memes: {
    bg: "bg-lime-500",
    text: "text-lime-500",
    border: "border-lime-500/40",
    bgGlow: "bg-lime-500/10",
    textOnDark: "text-lime-400",
    hex: "#84cc16",
  },
};

/** Default fallback — uses gold accent */
const defaultColor: CategoryColor = {
  bg: "bg-gold",
  text: "text-gold",
  border: "border-gold/40",
  bgGlow: "bg-gold/10",
  textOnDark: "text-gold",
  hex: "#e8c84a",
};

/**
 * Get the accent colour set for a given article category.
 * Case-insensitive lookup with gold fallback.
 */
export function getCategoryColor(category: string): CategoryColor {
  return palette[category.toLowerCase()] ?? defaultColor;
}

// ─── Career Domain Colors (Alumni Spotlight) ────────────────
import type { CareerDomain } from "@/types";

const careerPalette: Record<CareerDomain, CategoryColor> = {
  military: {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500/40",
    bgGlow: "bg-emerald-500/10",
    textOnDark: "text-emerald-400",
    hex: "#10b981",
  },
  defense_government: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500/40",
    bgGlow: "bg-blue-500/10",
    textOnDark: "text-blue-400",
    hex: "#3b82f6",
  },
  corporate: {
    bg: "bg-violet-500",
    text: "text-violet-500",
    border: "border-violet-500/40",
    bgGlow: "bg-violet-500/10",
    textOnDark: "text-violet-400",
    hex: "#8b5cf6",
  },
  academic: {
    bg: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500/40",
    bgGlow: "bg-amber-500/10",
    textOnDark: "text-amber-400",
    hex: "#f59e0b",
  },
  entrepreneurship: {
    bg: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500/40",
    bgGlow: "bg-rose-500/10",
    textOnDark: "text-rose-400",
    hex: "#f43f5e",
  },
};

const careerDefaultColor: CategoryColor = {
  bg: "bg-gold",
  text: "text-gold",
  border: "border-gold/40",
  bgGlow: "bg-gold/10",
  textOnDark: "text-gold",
  hex: "#e8c84a",
};

/** Get the accent colour for an alumni career domain. */
export function getCareerDomainColor(domain: CareerDomain): CategoryColor {
  return careerPalette[domain] ?? careerDefaultColor;
}

/** Human-readable labels for career domains. */
const careerLabels: Record<CareerDomain, string> = {
  military: "Military",
  defense_government: "Defence & Govt",
  corporate: "Corporate",
  academic: "Academic",
  entrepreneurship: "Entrepreneurship",
};

export function getCareerDomainLabel(domain: CareerDomain): string {
  return careerLabels[domain] ?? domain;
}

/**
 * Get the Tailwind classes for a category badge (pill).
 * Returns bg + contrasting text for the badge.
 */
export function getCategoryBadgeClasses(category: string): string {
  const c = getCategoryColor(category);
  // All badges use white text on the solid colour bg, except gold which uses dark bg text
  if (category.toLowerCase() === "leadership" || category.toLowerCase() === "culture") {
    return `${c.bg} text-background`;
  }
  return `${c.bg} text-white`;
}

/**
 * Get the Tailwind classes for a category filter tab (active state).
 */
export function getCategoryFilterClasses(category: string): string {
  const c = getCategoryColor(category);
  if (category.toLowerCase() === "leadership" || category.toLowerCase() === "culture") {
    return `${c.bg} text-background`;
  }
  return `${c.bg} text-white`;
}
