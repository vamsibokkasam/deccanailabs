const normalizeOrigin = (url) => url.replace(/\/$/, "").replace(/^["']|["']$/g, "");

const getAllowedOrigins = () => {
  const urls = process.env.CLIENT_URL || "http://localhost:5173";
  return urls
    .split(",")
    .map((url) => normalizeOrigin(url.trim()))
    .filter(Boolean);
};

const isAllowedOrigin = (origin) => {
  if (!origin) return false;

  const normalized = normalizeOrigin(origin);
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  if (normalized.includes("localhost") || normalized.includes("127.0.0.1")) {
    return true;
  }

  try {
    const { hostname } = new URL(normalized);
    if (hostname.endsWith(".vercel.app") || hostname === "vercel.app") {
      return true;
    }

    if (hostname === "deccanailabs.com" || hostname.endsWith(".deccanailabs.com")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
};

const corsMiddleware = (req, res, next) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
};

export { getAllowedOrigins, setCorsHeaders, isAllowedOrigin };
export default corsMiddleware;
