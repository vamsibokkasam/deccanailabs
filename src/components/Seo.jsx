import { useEffect } from "react";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "../config/organizationSchema";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  getOgImageUrl,
  OG_TITLE,
  SITE_TITLE,
  TWITTER_CARD,
  TWITTER_SITE,
} from "../config/seo";
import { getSiteUrl } from "../config/site.js";

const ORGANIZATION_JSON_LD_ID = "organization-jsonld";
const WEBSITE_JSON_LD_ID = "website-jsonld";
function upsertMeta(attribute, key, content) {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;

  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let element = document.head.querySelector(`script[data-jsonld="${id}"]`);

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.setAttribute("data-jsonld", id);
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

function applyTwitterMeta({ description, imageUrl, pageUrl }) {
  upsertMeta("name", "twitter:card", TWITTER_CARD);
  upsertMeta("name", "twitter:title", OG_TITLE);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", imageUrl);
  upsertMeta("name", "twitter:image:alt", `${OG_TITLE} logo`);

  if (TWITTER_SITE) {
    upsertMeta("name", "twitter:site", TWITTER_SITE);
  }

  if (pageUrl) {
    upsertMeta("name", "twitter:url", pageUrl);
  }
}

function Seo({ title, description, keywords, path, noindex = false }) {
  const pageTitle = title || SITE_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageKeywords = keywords || DEFAULT_KEYWORDS;

  useEffect(() => {
    const siteUrl = getSiteUrl();
    const ogImageUrl = getOgImageUrl(siteUrl);
    const canonicalPath = path?.startsWith("/") ? path : `/${path || ""}`;
    const pageUrl =
      path !== undefined
        ? `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`
        : "";

    document.title = pageTitle;

    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "keywords", pageKeywords);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    upsertMeta("property", "og:title", OG_TITLE);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", OG_TITLE);
    upsertMeta("property", "og:image", ogImageUrl);
    upsertMeta("property", "og:image:alt", `${OG_TITLE} logo`);

    applyTwitterMeta({
      description: pageDescription,
      imageUrl: ogImageUrl,
      pageUrl,
    });

    if (pageUrl) {
      upsertLink("canonical", pageUrl);
      upsertMeta("property", "og:url", pageUrl);
    }

    upsertJsonLd(ORGANIZATION_JSON_LD_ID, buildOrganizationJsonLd(siteUrl));
    upsertJsonLd(WEBSITE_JSON_LD_ID, buildWebSiteJsonLd(siteUrl));
  }, [pageTitle, pageDescription, pageKeywords, path, noindex]);

  return null;
}

export default Seo;
