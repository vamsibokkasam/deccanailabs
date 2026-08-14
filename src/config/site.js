import { ORGANIZATION_GSTIN } from "./branding.js";

/** Official production domain — used for canonical URLs, sitemap, and structured data. */
export const OFFICIAL_SITE_URL = "https://deccanailabs.com";

/** Public location label — update here if you add a physical office city later. */
export const ORGANIZATION_LOCATION =
  "2nd Cross, Nandini Layout, Bengaluru, Karnataka - 560096";

/** Display / SEO alternate names — legal name is primary; avoid bare "Deccan AI". */
export const BRAND_ALTERNATE_NAMES = [
  "DECCAN AI LABS",
  "DECCAN AI LABS Pvt Ltd",
  "Deccan AI Labs",
  "DeccanAILabs",
  "DeccanAILabs India",
];

export const ORGANIZATION_DESCRIPTION =
  "DECCAN AI LABS Private Limited (DeccanAILabs) is an India-based technology education and training company (GST No. 37AAMCD9617P1ZQ). We offer project-based internships and hands-on courses in AI, machine learning, web development, Python, Java, data science, and cyber security for students and early-career professionals. We are MSME, NCS, and ISO certified.";

/** CIN year — used in Organization structured data. */
export const ORGANIZATION_FOUNDING_YEAR = "2026";

/**
 * Short crawler-facing line so Google can separate this company from
 * Deccan AI / Deccan AI Experts (the enterprise AI training-data startup).
 */
export const BRAND_DISAMBIGUATING_DESCRIPTION =
  `India-incorporated technology education and internship company at deccanailabs.com (GST No. ${ORGANIZATION_GSTIN}). Not Deccan AI, not Deccan AI Experts, and not affiliated with any enterprise AI training-data company.`;

export const BRAND_DISAMBIGUATION =
  `DECCAN AI LABS Private Limited (DeccanAILabs) at deccanailabs.com is an independent technology education and internship company in India (GST No. ${ORGANIZATION_GSTIN}). We are not Deccan AI, not Deccan AI Experts, and not affiliated with, funded by, or connected to any enterprise AI, AI training-data, or reinforcement-learning company that uses a similar name.`;

/** Official organization certifications highlighted on the website. */
export const ORGANIZATION_CERTIFICATIONS = [
  {
    code: "MSME",
    title: "MSME Certified",
    image: "/MSME.jpeg",
    description:
      "Registered under India’s Micro, Small & Medium Enterprises framework.",
  },
  {
    code: "NCS",
    title: "NCS Certified",
    image: "/NCS.jpeg",
    description:
      "Recognized with National Career Service (NCS) certification.",
  },
  {
    code: "ISO",
    title: "ISO Certified",
    image: "/ISO.jpeg",
    description:
      "Committed to quality standards through ISO certification.",
  },
];

/** FAQ categories used by the FAQ section (Tap Academy–style tabs). */
export const FAQ_CATEGORIES = [
  {
    id: "general",
    label: "General FAQs",
    shortLabel: "General",
    items: [
      {
        question: "What is DeccanAILabs?",
        answer:
          "DECCAN AI LABS Private Limited (DeccanAILabs) is a company incorporated in India. We are a technology education and training platform providing online internships, certificates, and practical courses that help students build real-world skills in AI, web development, programming, and data science.",
      },
      {
        question: "Is DECCAN AI LABS a Private Limited company?",
        answer:
          "Yes. DECCAN AI LABS Private Limited is a company incorporated in India (GST No. 37AAMCD9617P1ZQ). DeccanAILabs is the brand name of this registered private limited company.",
      },
      {
        question: "Is DECCAN AI LABS the same as Deccan AI or Deccan AI Experts?",
        answer:
          "No. DECCAN AI LABS Private Limited (DeccanAILabs) at deccanailabs.com is an independent technology education and internship company in India (GST No. 37AAMCD9617P1ZQ). We are not Deccan AI, not Deccan AI Experts, and not affiliated with, funded by, or connected to any enterprise AI training-data or reinforcement-learning company that uses a similar name.",
      },
      {
        question: "Is DeccanAILabs MSME, NCS, and ISO certified?",
        answer:
          "Yes. DECCAN AI LABS Private Limited is MSME, NCS, and ISO certified, reflecting our commitment to quality, compliance, and trusted learning experiences for students and professionals.",
      },
      {
        question: "Do I need prior coding experience to join?",
        answer:
          "No. Beginners are welcome. Our programs start with foundational concepts and progressively move into projects, so learners at different skill levels can grow with mentor support.",
      },
      {
        question: "What kind of support do you provide?",
        answer:
          "Learners get mentor guidance, structured learning paths, project feedback, and support for building confidence through practical, industry-aligned work.",
      },
    ],
  },
  {
    id: "courses",
    label: "Courses",
    shortLabel: "Courses",
    items: [
      {
        question: "What courses do you offer?",
        answer:
          "We offer programs in AI & Machine Learning, Data Science, Web Development, Python Development, Java Development, and Cyber Security — designed around practical skills and real-world outcomes.",
      },
      {
        question: "How long are the courses?",
        answer:
          "Program duration varies by track. Most internship-linked learning paths are structured for focused skill building over a few weeks, with clear milestones and mentor checkpoints.",
      },
      {
        question: "What does the course curriculum include?",
        answer:
          "Each track combines core concepts, hands-on assignments, guided projects, and mentor feedback so you learn by building — not just watching lectures.",
      },
      {
        question: "Will I work on real projects?",
        answer:
          "Yes. Practical projects are a core part of our approach, helping you apply concepts, build portfolio-ready work, and gain confidence for interviews and industry roles.",
      },
      {
        question: "Do you provide certificates?",
        answer:
          "Yes. On successful completion of eligible programs, learners receive certificates that recognize their participation and practical learning outcomes.",
      },
    ],
  },
];

/** Flat FAQ list for SEO / structured data (all categories). */
export const BRAND_FAQ = FAQ_CATEGORIES.flatMap(({ items }) => items);

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
