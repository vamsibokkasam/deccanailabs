import { SITE_LOGO_PATH } from "./branding.js";
import {
  BRAND_ALTERNATE_NAMES,
  BRAND_FAQ,
  ORGANIZATION_DESCRIPTION,
  getSiteUrl,
} from "./site.js";

export const ORGANIZATION_NAME = "DeccanAILabs";

export const ORGANIZATION_EMAIL = "careers@deccanailabs.com";
export const ORGANIZATION_PHONE = "+91-63032-07231";

export const ORGANIZATION_SOCIAL_PROFILES = [
  "https://www.instagram.com/deccanailabs/",
  "https://www.linkedin.com/in/deccanailabs",
];

export function buildOrganizationJsonLd(siteUrl = getSiteUrl()) {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: ORGANIZATION_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: baseUrl,
    logo: `${baseUrl}${SITE_LOGO_PATH}`,
    description: ORGANIZATION_DESCRIPTION,
    email: ORGANIZATION_EMAIL,
    telephone: ORGANIZATION_PHONE,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Artificial Intelligence training",
      "Machine Learning internships",
      "Web Development courses",
      "Python programming",
      "Java development",
      "Data Science",
      "Cyber Security",
      "Technology education India",
    ],
    address: {
      "@type": "PostalAddress",
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

export function buildWebSiteJsonLd(siteUrl = getSiteUrl()) {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORGANIZATION_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: baseUrl,
    description: ORGANIZATION_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: {
      "@type": "EducationalOrganization",
      name: ORGANIZATION_NAME,
      url: baseUrl,
    },
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BRAND_FAQ.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
