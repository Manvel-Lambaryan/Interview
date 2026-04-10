import pinoHttp from "pino-http";
import { logger } from "../config/logger.js";

/**
 * HTTP request/response logging (method, path, status, duration) via pino-http.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customProps: (req) => ({
    requestId: req.id,
  }),
});
