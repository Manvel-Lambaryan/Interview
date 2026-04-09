import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { validateParams } from "../../middleware/validateParams.js";
import {
  recordClickBodySchema,
  shortCodeParamsSchema,
} from "../../validation/clicks.schema.js";
import { recordClickController } from "./clicks.controller.js";

export const clicksRouter = Router();

clicksRouter.post(
  "/:short_code/click",
  validateParams(shortCodeParamsSchema),
  validateBody(recordClickBodySchema),
  recordClickController,
);
