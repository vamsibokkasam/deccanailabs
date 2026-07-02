/** Official production domain — used for canonical URLs, sitemap, and structured data. */
export const OFFICIAL_SITE_URL = "https://deccanailabs.com";

export const BRAND_ALTERNATE_NAMES = [
  "Deccan AI Labs",
  "Deccan AI",
  "DECCAN AI labs",
  "DeccanAILabs",
];

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.PROD) {
    return OFFICIAL_SITE_URL;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return OFFICIAL_SITE_URL;
}
