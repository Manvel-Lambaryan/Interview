import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import { recordClick } from "../../integrations/clickRecording.js";
import * as clicksRepository from "./clicks.repository.js";

export async function getShortUrlByCodeOrThrow(shortCode) {
  const shortUrl = await clicksRepository.findShortUrlByCode(shortCode);
  if (!shortUrl) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }

  return shortUrl;
}

export async function recordClickByShortCode(shortCode, metadata) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  return recordClick(shortUrl.id, metadata);
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
