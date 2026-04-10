import { randomUUID } from "node:crypto";

const HEADER = "x-request-id";

/**
 * Ensures each request has a stable id (header or new UUID) for logs and tracing.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function requestId(req, res, next) {
  const raw = req.get(HEADER);
  const id =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
