/**
 * File upload validation and restriction guard.
 * Validates file sizes, allowed MIME types, magic byte signatures, and sanitizes filenames.
 */

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3MB limit
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Sanitizes a filename to prevent path traversal or special character injection.
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== "string") return "file";
  // Strip path traversal sequences and keep only alphanumeric, dashes, dots, underscores
  const base = fileName.split(/[/\\]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Validates uploaded image buffer against magic byte signatures.
 */
export function validateImageBytes(buffer: Buffer): UploadValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "File buffer is empty." };
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { valid: false, error: `File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.` };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  // JPEG magic bytes: FF D8 FF
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // WEBP magic bytes: RIFF....WEBP
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    return { valid: false, error: "Invalid image signature. Only PNG, JPEG, and WebP are permitted." };
  }

  return { valid: true };
}

/**
 * Validates a base64 data URL (e.g. from an avatar upload or canvas export).
 */
export function validateImageDataUrl(dataUrl: string): UploadValidationResult {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    // If it's a standard https:// URL to an external avatar, verify HTTPS
    if (typeof dataUrl === "string" && (dataUrl.startsWith("https://") || dataUrl.startsWith("/"))) {
      return { valid: true };
    }
    return { valid: false, error: "Invalid image URL format." };
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return { valid: false, error: "Malformed base64 image data URL." };
  }

  const mime = match[1];
  if (!ALLOWED_MIME_TYPES.includes(mime as any)) {
    return { valid: false, error: `MIME type "${mime}" is not allowed.` };
  }

  try {
    const buffer = Buffer.from(match[2], "base64");
    return validateImageBytes(buffer);
  } catch {
    return { valid: false, error: "Failed to decode base64 image data." };
  }
}
