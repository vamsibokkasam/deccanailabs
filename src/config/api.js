/** Render API — must match your live backend URL. */
export const PRODUCTION_API_URL = "https://deccanailabs.onrender.com/api";

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();

  // In production, /api only works with a reverse proxy; call Render directly instead.
  if (configured && !(import.meta.env.PROD && configured === "/api")) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "/api";
  }

  return PRODUCTION_API_URL;
}
