import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import * as clicksRepository from "./clicks.repository.js";

/**
 * Phase 0 contract helper:
 * both `POST /urls/:short_code/click` and redirect tracking should resolve
 * the target short URL through the same service-level lookup.
 */
export async function getShortUrlByCodeOrThrow(shortCode) {
  const shortUrl = await clicksRepository.findShortUrlByCode(shortCode);
  if (!shortUrl) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }

  return shortUrl;
}

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
 */
export async function recordRedirectClick(shortUrl, metadata) {
  return clicksRepository.createClick({
    short_url_id: shortUrl.id,
    ip_address: metadata.ip_address,
    country: metadata.country ?? null,
    device: metadata.device ?? "unknown",
  });
}

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
