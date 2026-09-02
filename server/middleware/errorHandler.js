import { setCorsHeaders } from "../config/cors.js";
import { isPrismaUniqueError, isPrismaUnavailableError } from "../utils/prismaErrors.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);
  setCorsHeaders(req, res);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large. Please use a smaller payment screenshot (max 5 MB).",
    });
  }

  if (isPrismaUniqueError(err)) {
    const target = err.meta?.target;
    const field = Array.isArray(target) ? target[0] : target;
    const message =
      field === "certNo"
        ? "A certificate with this certificate number already exists"
        : "This transaction ID has already been submitted";

    return res.status(409).json({
      success: false,
      message,
    });
  }

  if (isPrismaUnavailableError(err) || err.name === "PrismaClientInitializationError") {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please try again.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Server error",
  });
};

export default errorHandler;
