import { SITE_LOGO_PATH } from "./branding.js";
import { DEFAULT_DESCRIPTION } from "./seo.js";

export const ORGANIZATION_NAME = "DeccanAILabs";
export const ORGANIZATION_URL = "https://deccanailabs.vercel.app";

export const ORGANIZATION_EMAIL = "deccanailabs212@gmail.com";
export const ORGANIZATION_PHONE = "+91-63032-07231";

export const ORGANIZATION_SOCIAL_PROFILES = [
  "https://www.instagram.com/deccanailabs/",
  "https://www.linkedin.com/in/deccanailabs",
];

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  return (configured || ORGANIZATION_URL).replace(/\/$/, "");
}

export function buildOrganizationJsonLd(siteUrl = getSiteUrl()) {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: baseUrl,
    logo: `${baseUrl}${SITE_LOGO_PATH}`,
    description: DEFAULT_DESCRIPTION,
    email: ORGANIZATION_EMAIL,
    telephone: ORGANIZATION_PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: ORGANIZATION_PHONE,
        email: ORGANIZATION_EMAIL,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English"],
      },
    ],
    sameAs: ORGANIZATION_SOCIAL_PROFILES,
  };
}
