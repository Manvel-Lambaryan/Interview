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

export async function getShortUrlAnalyticsController(req, res, next) {
  try {
    const analytics = await clicksService.getShortUrlAnalytics(
      req.params.short_code,
      req.query,
    );
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}

export async function getShortUrlDailyAnalyticsController(req, res, next) {
  try {
    const analytics = await clicksService.getShortUrlDailyAnalytics(
      req.params.short_code,
      req.query,
    );
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}

export async function getShortUrlDeviceAnalyticsController(req, res, next) {
  try {
    const analytics = await clicksService.getShortUrlDeviceAnalytics(
      req.params.short_code,
      req.query,
    );
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}

export async function getTopUrlsController(_req, res, next) {
  try {
    const urls = await clicksService.getTopUrls();
    res.status(200).json(urls);
  } catch (e) {
    next(e);
  }
}
