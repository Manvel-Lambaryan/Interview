import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { createShortUrlBodySchema } from "../../validation/urls.schema.js";
import {
  createShortUrlController,
  redirectByShortCodeController,
} from "./urls.controller.js";

export const urlsRouter = Router();

urlsRouter.post(
  "/",
  validateBody(createShortUrlBodySchema),
  createShortUrlController,
);
urlsRouter.get("/:short_code", redirectByShortCodeController);
