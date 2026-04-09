import { AppError } from "../errors/AppError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err instanceof Error
        ? err.message
        : "Unknown error";

  console.error(err);
  return res.status(500).json({ error: message });
}
