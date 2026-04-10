import pino from "pino";
import { env } from "./env.js";

/**
 * Root Pino instance. Per-request child loggers are attached by `pino-http` as `req.log`.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    env: env.NODE_ENV,
  },
});
