import pinoHttp from "pino-http";
import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customProps: (req) => ({
    requestId: req.id,
  }),
});
