export const STATIC_SITEMAP_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.9" },
  { path: "/team", changefreq: "monthly", priority: "0.8" },
  { path: "/programs", changefreq: "monthly", priority: "0.8" },
  { path: "/internships", changefreq: "weekly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4" },
  { path: "/help-support", changefreq: "monthly", priority: "0.6" },
];

export const DEFAULT_SITE_URL = "https://deccanailabs.vercel.app";

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim();
  if (clientUrl) return clientUrl.replace(/\/$/, "");

  return DEFAULT_SITE_URL;
}
