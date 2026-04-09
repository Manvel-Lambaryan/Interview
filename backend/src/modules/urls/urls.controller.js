import * as urlsService from "./urls.service.js";

function toShortUrlResponse(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    short_code: row.short_code,
    original_url: row.original_url,
    created_at: row.created_at.toISOString(),
    expires_at: row.expires_at ? row.expires_at.toISOString() : null,
  };
}

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
