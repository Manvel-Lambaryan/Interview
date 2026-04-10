import { runWithRequestContext } from "../logging/requestContext.js";

/**
 * Binds `requestId` to AsyncLocalStorage for the duration of the request.
 * Must run after `requestId` (so `req.id` is set).
 */
export function bindRequestContext(req, res, next) {
  runWithRequestContext(req.id, next);
}
