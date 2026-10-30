/**
 * Input sanitization and HTML escaping to prevent XSS (Cross-Site Scripting).
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes characters with HTML entities.
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips null bytes and dangerous control characters from user text input.
 */
export function sanitizePlainText(input: unknown): string {
  if (typeof input !== "string") return "";
  // Strip null bytes and non-printable control characters (except newline and tab)
  return input
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

/**
 * Recursively sanitizes string properties in an object.
 */
export function sanitizeRecord<T extends Record<string, any>>(record: T): T {
  if (!record || typeof record !== "object") return record;
  const result: any = Array.isArray(record) ? [] : {};

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      result[key] = sanitizePlainText(value);
    } else if (value && typeof value === "object") {
      result[key] = sanitizeRecord(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
