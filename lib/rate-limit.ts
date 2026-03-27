/**
 * Simple in-memory rate limiter for API routes.
 * No external dependencies — uses a Map with auto-cleanup.
 */

/** Configurable rate limits (override via env vars) */
export const RATE_LIMITS = {
  SUBMISSIONS_PER_MIN: Number(process.env.RATE_LIMIT_SUBMISSIONS) || 5,
  COMMENTS_PER_MIN: Number(process.env.RATE_LIMIT_COMMENTS) || 5,
  COMMENTS_PER_AUTHOR: Number(process.env.RATE_LIMIT_COMMENTS_AUTHOR) || 3,
  UPLOADS_PER_MIN: Number(process.env.RATE_LIMIT_UPLOADS) || 10,
  TOKEN_VALIDATIONS_PER_MIN: Number(process.env.RATE_LIMIT_TOKENS) || 20,
} as const;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request is rate limited.
 * @param key - Unique identifier (e.g., IP address + route)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 * @returns { limited: boolean, remaining: number }
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs = 60_000
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxRequests - 1 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: maxRequests - entry.count };
}

/**
 * Verify request origin to prevent CSRF attacks.
 * Checks that the Origin or Referer header matches allowed domains.
 * Returns true if the request is safe, false if it should be rejected.
 */
export function verifyCsrf(headers: Headers): boolean {
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  // Allow requests without Origin header (same-origin, non-browser clients)
  if (!origin && !referer) return true;

  const allowed = [
    "https://ghorpad-2026.vercel.app",
    "https://ghorpad.online",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  if (origin && allowed.some((a) => origin.startsWith(a))) return true;
  if (referer && allowed.some((a) => referer.startsWith(a))) return true;

  return false;
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
