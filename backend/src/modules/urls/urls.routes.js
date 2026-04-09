import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { attachTagBodySchema } from "../../validation/tags.schema.js";
import { createShortUrlBodySchema } from "../../validation/urls.schema.js";
import {
  attachTagToShortUrlController,
  createShortUrlController,
  deleteShortUrlByCodeController,
  listTagsForShortUrlController,
  redirectByShortCodeController,
} from "./urls.controller.js";

export const urlsRouter = Router();

urlsRouter.post(
  "/",
  validateBody(createShortUrlBodySchema),
  createShortUrlController,
);
urlsRouter.get("/:short_code/tags", listTagsForShortUrlController);
urlsRouter.post(
  "/:short_code/tags",
  validateBody(attachTagBodySchema),
  attachTagToShortUrlController,
);
urlsRouter.delete("/:short_code", deleteShortUrlByCodeController);
urlsRouter.get("/:short_code", redirectByShortCodeController);
