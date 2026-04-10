import { runWithRequestContext } from "../logging/requestContext.js";

export function bindRequestContext(req, res, next) {
  runWithRequestContext(req.id, next);
}
