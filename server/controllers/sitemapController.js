import { buildRobotsTxt, buildSitemapXml } from "../utils/buildSitemap.js";
import { getSiteUrl, STATIC_SITEMAP_ROUTES } from "../config/sitemapRoutes.js";

function buildFallbackSitemapXml() {
  const siteUrl = getSiteUrl();
  const today = new Date().toISOString().split("T")[0];

  const urls = STATIC_SITEMAP_ROUTES.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path === "/" ? "" : path}</loc>
    <lastmod>${today}</lastmod>
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

export const getSitemap = async (req, res) => {
  try {
    const xml = await buildSitemapXml();
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Sitemap generation failed, using static fallback:", error.message);
    res.type("application/xml").send(buildFallbackSitemapXml());
  }
};

export const getRobots = (req, res) => {
  res.type("text/plain").send(buildRobotsTxt());
};
