import * as analyticsService from "./analytics.service.js";

export async function getShortUrlAnalyticsController(req, res, next) {
  try {
    const analytics = await analyticsService.getShortUrlAnalytics(
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
    const analytics = await analyticsService.getShortUrlDailyAnalytics(
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
    const analytics = await analyticsService.getShortUrlDeviceAnalytics(
      req.params.short_code,
      req.query,
    );
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}

export async function getUserAnalyticsController(req, res, next) {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.params.id);
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}

export async function getTopUrlsController(_req, res, next) {
  try {
    const urls = await analyticsService.getTopUrls();
    res.status(200).json(urls);
  } catch (e) {
    next(e);
  }
}
