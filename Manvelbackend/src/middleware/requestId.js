import { randomUUID } from "node:crypto";

const HEADER = "x-request-id";


export function requestId(req, res, next) {
  const raw = req.get(HEADER);
  const id =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
