/** Official production domain — used for canonical URLs, sitemap, and structured data. */
export const OFFICIAL_SITE_URL = "https://deccanailabs.com";

/** Public location label — update here if you add a physical office city later. */
export const ORGANIZATION_LOCATION = "India";

/** Display / SEO alternate names — avoid bare "Deccan AI" to reduce confusion with unrelated companies. */
export const BRAND_ALTERNATE_NAMES = [
  "DECCAN AI labs",
  "Deccan AI Labs",
  "DeccanAILabs",
  "DeccanAILabs India",
];

export const ORGANIZATION_DESCRIPTION =
  "DeccanAILabs (DECCAN AI labs) is an India-based technology education and training platform. We offer project-based internships and hands-on courses in AI, machine learning, web development, Python, Java, data science, and cyber security for students and early-career professionals.";

export const BRAND_FAQ = [
  {
    question: "What is DeccanAILabs?",
    answer:
      "DeccanAILabs (DECCAN AI labs) is an India-based technology education and training platform. We provide online internships, certificates, and practical courses that help students build real-world skills in AI, web development, programming, and data science.",
  },
  {
    question: "Is DeccanAILabs the same as Deccan AI?",
    answer:
      "No. DeccanAILabs at deccanailabs.com is an independent education and internship platform based in India. It is not affiliated with, funded by, or connected to any other unrelated companies that may use similar names in the global artificial intelligence industry.",
  },
  {
    question: "What programs does DeccanAILabs offer?",
    answer:
      "DeccanAILabs offers internship and training programs in AI & Machine Learning, Data Science, Web Development, Python Development, Java Development, and Cyber Security — with mentor support, real-time projects, and certificates.",
  },
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
