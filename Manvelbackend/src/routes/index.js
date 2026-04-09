import { Router } from "express";
import { urlsRouter } from "../modules/urls/urls.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/urls", urlsRouter);
