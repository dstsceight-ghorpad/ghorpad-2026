import crypto from "crypto";

/**
 * HMAC-signed token for time-restricted photo upload access.
 * Token format: base36(expiryMs).hmacHex
 */

export function generateUploadToken(expiresAt: Date): string {
  const secret = process.env.UPLOAD_TOKEN_SECRET!;
  const expiry = expiresAt.getTime().toString(36);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`photo-upload:${expiresAt.getTime()}`)
    .digest("hex");
  return `${expiry}.${signature}`;
}

export function validateUploadToken(token: string): {
  valid: boolean;
  expired?: boolean;
} {
  try {
    const secret = process.env.UPLOAD_TOKEN_SECRET;
    if (!secret) return { valid: false };

    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) return { valid: false };

    const expiryBase36 = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);
    if (!expiryBase36 || !signature) return { valid: false };

    const expiresAt = parseInt(expiryBase36, 36);
    if (isNaN(expiresAt)) return { valid: false };

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`photo-upload:${expiresAt}`)
      .digest("hex");

    if (signature !== expectedSignature) return { valid: false };
    if (Date.now() > expiresAt) return { valid: false, expired: true };

    return { valid: true };
  } catch {
    return { valid: false };
  }
}
