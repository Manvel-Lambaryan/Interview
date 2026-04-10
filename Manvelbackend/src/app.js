import express from "express";
import { bindRequestContext } from "./middleware/bindRequestContext.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  app.use(requestId);
  app.use(bindRequestContext);
  app.use(requestLogger);
  app.use(express.json());
  app.use(apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
