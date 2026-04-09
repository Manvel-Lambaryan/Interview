import { Router } from "express";
import { validateParams } from "../../middleware/validateParams.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import {
  clickAnalyticsQuerySchema,
  shortCodeParamsSchema,
} from "../../validation/clicks.schema.js";
import { userIdParamsSchema } from "../../validation/users.schema.js";
import {
  getShortUrlAnalyticsController,
  getShortUrlDailyAnalyticsController,
  getShortUrlDeviceAnalyticsController,
  getTopUrlsController,
  getUserAnalyticsController,
} from "./analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/urls/top", getTopUrlsController);
analyticsRouter.get(
  "/users/:id/analytics",
  validateParams(userIdParamsSchema),
  getUserAnalyticsController,
);
analyticsRouter.get(
  "/urls/:short_code/analytics/daily",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlDailyAnalyticsController,
);
analyticsRouter.get(
  "/urls/:short_code/analytics/devices",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlDeviceAnalyticsController,
);
analyticsRouter.get(
  "/urls/:short_code/analytics",
  validateParams(shortCodeParamsSchema),
  validateQuery(clickAnalyticsQuerySchema),
  getShortUrlAnalyticsController,
);
