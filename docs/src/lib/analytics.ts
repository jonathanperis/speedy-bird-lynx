/** Optional GA4 measurement ID. Analytics is entirely absent from the build when unset. */
const rawId = import.meta.env.PUBLIC_GA_ID?.trim();

export const GA_ID: string | undefined = rawId && /^G-[A-Z0-9]+$/i.test(rawId) ? rawId : undefined;

if (rawId && !GA_ID) {
  console.warn(`[analytics] Ignoring malformed PUBLIC_GA_ID "${rawId}"; expected a GA4 ID such as G-XXXXXXX.`);
}
