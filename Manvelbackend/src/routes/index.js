import { Router } from "express";
import { clicksRouter } from "../modules/clicks/clicks.routes.js";
import { urlsRouter } from "../modules/urls/urls.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/urls", clicksRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/urls", urlsRouter);
