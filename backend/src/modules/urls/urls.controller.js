import * as urlsService from "./urls.service.js";
import { toShortUrlResponse } from "./urls.presenter.js";

export async function createShortUrlController(req, res, next) {
  try {
    const row = await urlsService.createShortUrl(req.body);
    res.status(201).json(toShortUrlResponse(row));
  } catch (e) {
    next(e);
  }
}

export async function redirectByShortCodeController(req, res, next) {
  try {
    const row = await urlsService.getRedirectTarget(req.params.short_code);
    res.redirect(302, row.original_url);
  } catch (e) {
    next(e);
  }
}
