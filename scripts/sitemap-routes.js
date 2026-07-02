/**
 * Public, indexable routes for sitemap.xml.
 * Excludes /admin (noindex). Internship apply pages are included.
 */

function courseTitleToSlug(title) {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const INTERNSHIP_COURSE_TITLES = [
  "Python Development",
  "Java Development",
  "Web Development",
  "AI & Machine Learning",
  "Data Science",
  "Cyber Security",
];

export const SITEMAP_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.9" },
  { path: "/team", changefreq: "monthly", priority: "0.8" },
  { path: "/programs", changefreq: "monthly", priority: "0.8" },
  { path: "/internships", changefreq: "weekly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4" },
  { path: "/help-support", changefreq: "monthly", priority: "0.6" },
  ...INTERNSHIP_COURSE_TITLES.map((title) => ({
    path: `/internship/apply/${courseTitleToSlug(title)}`,
    changefreq: "weekly",
    priority: "0.7",
  })),
];

export const DEFAULT_SITE_URL = "https://deccanailabs.com";

export const SITEMAP_DISALLOW_PATHS = ["/admin"];
