import { getDbStatus } from "../config/db.js";
import prisma from "../config/prisma.js";
import { getSiteUrl, STATIC_SITEMAP_ROUTES } from "../config/sitemapRoutes.js";
import { courseTitleToSlug } from "./courseSlug.js";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastmod(date) {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatLastmod(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function getSitemapUrlEntries() {
  const siteUrl = getSiteUrl();

  const staticEntries = STATIC_SITEMAP_ROUTES.map(({ path, changefreq, priority }) => ({
    loc: `${siteUrl}${path === "/" ? "" : path}`,
    lastmod: new Date(),
    changefreq,
    priority,
  }));

  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  const programEntries = programs.map((program) => ({
    loc: `${siteUrl}/internship/apply/${courseTitleToSlug(program.title)}`,
    lastmod: program.updatedAt || program.createdAt,
    changefreq: "weekly",
    priority: "0.7",
  }));

  return [...staticEntries, ...programEntries];
}

export async function buildSitemapXml() {
  if (getDbStatus().status !== "connected") {
    throw new Error("Database not connected");
  }

  const entries = await getSitemapUrlEntries();
  const urls = entries.map(buildUrlEntry).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt() {
  const siteUrl = getSiteUrl();

  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /courses

Sitemap: ${siteUrl}/sitemap.xml
`;
}
