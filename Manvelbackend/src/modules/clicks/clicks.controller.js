import * as clicksService from "./clicks.service.js";

export async function recordClickController(req, res, next) {
  try {
    await clicksService.recordClickByShortCode(
      req.params.short_code,
      clicksService.getClickMetadataFromRequest(req),
    );
    res.status(201).json({ message: "Click recorded" });
  } catch (e) {
    next(e);
  }
}
