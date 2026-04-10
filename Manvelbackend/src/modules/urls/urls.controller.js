import { recordClick } from "../../integrations/index.js";
import * as clicksService from "../clicks/clicks.service.js";
import * as urlsService from "./urls.service.js";
import { toShortUrlResponse, toTagResponse } from "./urls.presenter.js";

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
    await recordClick(row.id, clicksService.getClickMetadataFromRequest(req));
    res.redirect(302, row.original_url);
  } catch (e) {
    next(e);
  }
}

export async function deleteShortUrlByCodeController(req, res, next) {
  try {
    await urlsService.deleteShortUrlByCode(req.params.short_code);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function attachTagToShortUrlController(req, res, next) {
  try {
    const tag = await urlsService.attachTagToShortUrl(
      req.params.short_code,
      req.body,
    );
    res.status(201).json(toTagResponse(tag));
  } catch (e) {
    next(e);
  }
}

export async function listTagsForShortUrlController(req, res, next) {
  try {
    const tags = await urlsService.listTagsForShortUrl(req.params.short_code);
    res.status(200).json(tags.map(toTagResponse));
  } catch (e) {
    next(e);
  }
}

export async function listShortUrlsByTagController(req, res, next) {
  try {
    const rows = await urlsService.listShortUrlsByTagName(req.query.tag);
    res.status(200).json(rows.map(toShortUrlResponse));
  } catch (e) {
    next(e);
  }
}
