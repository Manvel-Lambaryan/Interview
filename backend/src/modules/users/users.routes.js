import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { registerUserBodySchema } from "../../validation/users.schema.js";
import { registerUserController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.post(
  "/",
  validateBody(registerUserBodySchema),
  registerUserController,
);
