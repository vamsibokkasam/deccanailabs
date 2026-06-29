import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SITE_URL,
  SITEMAP_DISALLOW_PATHS,
  SITEMAP_ROUTES,
} from "./sitemap-routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
const lastmod = new Date().toISOString().split("T")[0];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml() {
  const urls = SITEMAP_ROUTES.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${escapeXml(`${siteUrl}${path === "/" ? "" : path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobotsTxt() {
  const disallowRules = SITEMAP_DISALLOW_PATHS.map((path) => `Disallow: ${path}`).join(
    "\n"
  );

  return `User-agent: *
Allow: /
${disallowRules}

Sitemap: ${siteUrl}/sitemap.xml
`;
}

const sitemapPath = join(publicDir, "sitemap.xml");
const robotsPath = join(publicDir, "robots.txt");

writeFileSync(sitemapPath, buildSitemapXml(), "utf8");
writeFileSync(robotsPath, buildRobotsTxt(), "utf8");

console.log(`Generated ${sitemapPath}`);
console.log(`Generated ${robotsPath}`);
console.log(`Site URL: ${siteUrl}`);
