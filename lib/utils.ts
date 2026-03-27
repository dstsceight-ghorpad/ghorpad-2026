/** Convert a title string into a URL-friendly slug (lowercase, hyphens only). */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Estimate article read time in minutes from TipTap JSON content (200 WPM). */
export function estimateReadTime(content: Record<string, unknown> | null): number {
  if (!content) return 1;
  const text = extractTextFromTipTap(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Recursively extract plain text from a TipTap JSON node tree. */
export function extractTextFromTipTap(node: Record<string, unknown>): string {
  let text = "";
  if (node.text && typeof node.text === "string") {
    text += node.text + " ";
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromTipTap(child as Record<string, unknown>);
    }
  }
  return text;
}

/** Format an ISO date string as "Month Day, Year" (e.g. "March 27, 2026"). */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format an ISO date string as "Mon Day, Year" (e.g. "Mar 27, 2026"). */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Convert byte count to human-readable size string (e.g. "1.5 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/** Combine CSS class names, filtering out falsy values. */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
