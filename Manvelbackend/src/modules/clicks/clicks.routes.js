import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { validateParams } from "../../middleware/validateParams.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import {
  clickAnalyticsQuerySchema,
  recordClickBodySchema,
  shortCodeParamsSchema,
} from "../../validation/clicks.schema.js";
import {
  getShortUrlAnalyticsController,
  getShortUrlDailyAnalyticsController,
  getShortUrlDeviceAnalyticsController,
  getTopUrlsController,
  recordClickController,
} from "./clicks.controller.js";

export const clicksRouter = Router();

clicksRouter.get("/top", getTopUrlsController);
clicksRouter.post(
  "/:short_code/click",
  validateParams(shortCodeParamsSchema),
  validateBody(recordClickBodySchema),
  recordClickController,
);
clicksRouter.get(
  "/:short_code/analytics/daily",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlDailyAnalyticsController,
);
clicksRouter.get(
  "/:short_code/analytics/devices",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlDeviceAnalyticsController,
);
clicksRouter.get(
  "/:short_code/analytics",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlAnalyticsController,
);
