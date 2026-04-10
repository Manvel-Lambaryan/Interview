import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors/AppError.js";


export function errorHandler(err, req, res, _next) {
  const log = req.log ?? logger;

  if (err instanceof AppError) {
    log.warn(
      { err, code: err.code, statusCode: err.statusCode },
      err.message,
    );
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  const message =
    env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err instanceof Error
        ? err.message
        : "Unknown error";

  log.error({ err }, "Unhandled error");
  return res.status(500).json({ error: message });
}
