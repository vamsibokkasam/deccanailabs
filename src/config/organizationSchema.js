import { BRAND_LEGAL_NAME, ORGANIZATION_GSTIN, SITE_LOGO_PATH } from "./branding.js";
import {
  BRAND_ALTERNATE_NAMES,
  BRAND_DISAMBIGUATING_DESCRIPTION,
  BRAND_FAQ,
  ORGANIZATION_DESCRIPTION,
  ORGANIZATION_FOUNDING_YEAR,
  getSiteUrl,
} from "./site.js";

export const ORGANIZATION_NAME = BRAND_LEGAL_NAME;

export const ORGANIZATION_EMAIL = "careers@deccanailabs.com";
export const ORGANIZATION_PHONE = "+91-98454-28526";

export const ORGANIZATION_SOCIAL_PROFILES = [
  "https://www.instagram.com/deccanailabs/",
  "https://www.linkedin.com/in/deccanailabs",
];

const ORGANIZATION_LEADERS = [
  {
    name: "B VAMSI",
    jobTitle: "CEO & Founder",
    image: "/1000354279.jpg",
    founder: true,
  },
  {
    name: "K GANESH",
    jobTitle: "Co-Founder & Marketing",
    image: "/Ganesh_Profile.jpeg",
    founder: true,
  },
  {
    name: "U KEERTHI PRIYA",
    jobTitle: "MD & HR",
    image: "/Keerthi_photo.png",
    founder: false,
  },
  {
    name: "M BALAJI",
    jobTitle: "CTO & BDM",
    image: "/Balaji_Professional_Photo.png",
    founder: false,
  },
];

function personNode(baseUrl, member) {
  const slug = member.name.toLowerCase().replace(/\s+/g, "-");
  return {
    "@type": "Person",
    "@id": `${baseUrl}/team#${slug}`,
    name: member.name,
    jobTitle: member.jobTitle,
    image: `${baseUrl}${member.image}`,
    worksFor: { "@id": `${baseUrl}/#organization` },
  };
}

export function buildOrganizationJsonLd(siteUrl = getSiteUrl()) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const people = ORGANIZATION_LEADERS.map((member) => personNode(baseUrl, member));
  const founders = people.filter((_, index) => ORGANIZATION_LEADERS[index].founder);

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${baseUrl}/#organization`,
    name: ORGANIZATION_NAME,
    legalName: BRAND_LEGAL_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    slogan: "Innovate · Learn · Transform",
    taxID: ORGANIZATION_GSTIN,
    vatID: ORGANIZATION_GSTIN,
    identifier: {
      "@type": "PropertyValue",
      name: "GSTIN",
      propertyID: "GST No.",
      value: ORGANIZATION_GSTIN,
    },
    foundingDate: ORGANIZATION_FOUNDING_YEAR,
    url: baseUrl,
    logo: `${baseUrl}${SITE_LOGO_PATH}`,
    image: [
      `${baseUrl}${SITE_LOGO_PATH}`,
      ...ORGANIZATION_LEADERS.map((member) => `${baseUrl}${member.image}`),
    ],
    description: ORGANIZATION_DESCRIPTION,
    disambiguatingDescription: BRAND_DISAMBIGUATING_DESCRIPTION,
    email: ORGANIZATION_EMAIL,
    telephone: ORGANIZATION_PHONE,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Student internships India",
      "Technology education",
      "Artificial Intelligence training",
      "Machine Learning internships",
      "Web Development courses",
      "Python programming",
      "Java development",
      "Data Science",
      "Cyber Security",
    ],
    founder: founders,
    employee: people,
    address: {
      "@type": "PostalAddress",
      streetAddress: "2nd Cross, Nandini Layout",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560096",
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
      "@id": `${baseUrl}/#organization`,
      name: ORGANIZATION_NAME,
      legalName: BRAND_LEGAL_NAME,
      taxID: ORGANIZATION_GSTIN,
      identifier: {
        "@type": "PropertyValue",
        name: "GSTIN",
        propertyID: "GST No.",
        value: ORGANIZATION_GSTIN,
      },
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
