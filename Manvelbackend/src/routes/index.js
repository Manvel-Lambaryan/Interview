import { Router } from "express";
import { analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { clicksRouter } from "../modules/clicks/clicks.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { urlsRouter } from "../modules/urls/urls.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/", analyticsRouter);
apiRouter.use("/urls", clicksRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/urls", urlsRouter);
