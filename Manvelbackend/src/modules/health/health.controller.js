import * as healthService from "./health.service.js";

export async function getHealthController(_req, res) {
  try {
    await healthService.pingDatabase();
    res.status(200).json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "down" });
  }
}
