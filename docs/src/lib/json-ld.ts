/** Serialize structured data for a `<script type="application/ld+json">` body. */
export function jsonLd(data: Record<string, unknown>): string {
  // Escape "<" so no value can close the script element early.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
