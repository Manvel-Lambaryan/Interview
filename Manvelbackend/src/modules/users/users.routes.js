import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { validateParams } from "../../middleware/validateParams.js";
import {
  registerUserBodySchema,
  userIdParamsSchema,
} from "../../validation/users.schema.js";
import { listUserUrlsController, registerUserController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.post(
  "/",
  validateBody(registerUserBodySchema),
  registerUserController,
);
usersRouter.get(
  "/:id/urls",
  validateParams(userIdParamsSchema),
  listUserUrlsController,
);
