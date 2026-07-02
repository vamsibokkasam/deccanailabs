export const OFFICIAL_SITE_URL = "https://deccanailabs.com";

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim();
  if (clientUrl) return clientUrl.replace(/\/$/, "");

  return OFFICIAL_SITE_URL;
}
