import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import { findUserById } from "../users/users.repository.js";
import * as clicksRepository from "./clicks.repository.js";

/**
 * Phase 0 contract helper:
 * both `POST /urls/:short_code/click` and redirect tracking should resolve
 * the target short URL through the same service-level lookup.
 *
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").ShortURL>}
 */
export async function getShortUrlByCodeOrThrow(shortCode) {
  const shortUrl = await clicksRepository.findShortUrlByCode(shortCode);
  if (!shortUrl) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }

  return shortUrl;
}

/**
 * @param {string} shortCode
 * @param {{
 *   ip_address: string;
 *   country?: string | null;
 *   device?: "mobile" | "desktop" | "tablet" | "unknown" | null;
 * }} metadata
 */
export async function recordClickByShortCode(shortCode, metadata) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  return clicksRepository.createClick({
    short_url_id: shortUrl.id,
    ip_address: metadata.ip_address,
    country: metadata.country ?? null,
    device: metadata.device ?? "unknown",
  });
}

/**
 * Shared hook for redirect flow so we do not make an internal HTTP request.
 *
 * @param {{ id: string }} shortUrl
 * @param {{
 *   ip_address: string;
 *   country?: string | null;
 *   device?: "mobile" | "desktop" | "tablet" | "unknown" | null;
 * }} metadata
 */
export async function recordRedirectClick(shortUrl, metadata) {
  return clicksRepository.createClick({
    short_url_id: shortUrl.id,
    ip_address: metadata.ip_address,
    country: metadata.country ?? null,
    device: metadata.device ?? "unknown",
  });
}

/**
 * @param {string} shortCode
 * @param {{ from?: string; to?: string }} query
 */
export async function getShortUrlAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  return {
    total_clicks: await clicksRepository.countClicksByShortUrlId(
      shortUrl.id,
      buildDateRange(query),
    ),
  };
}

/**
 * @param {string} shortCode
 * @param {{ from?: string; to?: string }} query
 */
export async function getShortUrlDailyAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  const rows = await clicksRepository.countDailyClicksByShortUrlId(
    shortUrl.id,
    buildDateRange(query),
  );

  return rows.map((row) => ({
    date: new Date(row.date).toISOString().slice(0, 10),
    clicks: Number(row.clicks),
  }));
}

/**
 * @param {string} shortCode
 * @param {{ from?: string; to?: string }} query
 */
export async function getShortUrlDeviceAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  const rows = await clicksRepository.countClicksByDeviceByShortUrlId(
    shortUrl.id,
    buildDateRange(query),
  );

  return rows.map((row) => ({
    device: row.device ?? "unknown",
    clicks: row._count._all,
  }));
}

/**
 * @param {string} userId
 */
export async function getUserAnalytics(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found", ErrorCodes.NOT_FOUND_USER);
  }

  return {
    total_clicks: await clicksRepository.countClicksByUserId(userId),
  };
}

export async function getTopUrls() {
  const rows = await clicksRepository.findTopShortUrls(5);
  return rows.map((row) => ({
    short_code: row.short_code,
    total_clicks: Number(row.total_clicks),
  }));
}

/**
 * @param {{
 *   body?: {
 *     country?: string;
 *     device?: "mobile" | "desktop" | "tablet" | "unknown";
 *   };
 *   headers?: Record<string, unknown>;
 *   ip?: string;
 *   socket?: { remoteAddress?: string | undefined };
 * }} reqLike
 */
export function getClickMetadataFromRequest(reqLike) {
  const forwardedForHeader = reqLike.headers?.["x-forwarded-for"];
  const forwardedFor =
    typeof forwardedForHeader === "string"
      ? forwardedForHeader.split(",")[0]?.trim()
      : undefined;

  return {
    ip_address:
      forwardedFor ?? reqLike.ip ?? reqLike.socket?.remoteAddress ?? "unknown",
    country: reqLike.body?.country?.trim() || null,
    device: reqLike.body?.device ?? detectDeviceFromHeaders(reqLike.headers),
  };
}

/**
 * @param {Record<string, unknown> | undefined} headers
 * @returns {"mobile" | "desktop" | "tablet" | "unknown"}
 */
function detectDeviceFromHeaders(headers) {
  const userAgent = headers?.["user-agent"];
  if (typeof userAgent !== "string") {
    return "unknown";
  }

  const normalized = userAgent.toLowerCase();
  if (normalized.includes("tablet") || normalized.includes("ipad")) {
    return "tablet";
  }

  if (
    normalized.includes("mobile") ||
    normalized.includes("iphone") ||
    normalized.includes("android")
  ) {
    return "mobile";
  }

  if (
    normalized.includes("windows") ||
    normalized.includes("macintosh") ||
    normalized.includes("linux")
  ) {
    return "desktop";
  }

  return "unknown";
}

/**
 * @param {{ from?: string; to?: string }} query
 */
function buildDateRange(query) {
  return {
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  };
}
