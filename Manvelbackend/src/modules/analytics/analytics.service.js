import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import { findUserById } from "../users/users.repository.js";
import { buildDateRange } from "../clicks/clicks.analytics.js";
import { getShortUrlByCodeOrThrow } from "../clicks/clicks.service.js";
import * as analyticsRepository from "./analytics.repository.js";

export async function getShortUrlAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  return {
    total_clicks: await analyticsRepository.countClicksByShortUrlId(
      shortUrl.id,
      buildDateRange(query),
    ),
  };
}

export async function getShortUrlDailyAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  const rows = await analyticsRepository.countDailyClicksByShortUrlId(
    shortUrl.id,
    buildDateRange(query),
  );

  return rows.map((row) => ({
    date: new Date(row.date).toISOString().slice(0, 10),
    clicks: Number(row.clicks),
  }));
}

export async function getShortUrlDeviceAnalytics(shortCode, query = {}) {
  const shortUrl = await getShortUrlByCodeOrThrow(shortCode);
  const rows = await analyticsRepository.countClicksByDeviceByShortUrlId(
    shortUrl.id,
    buildDateRange(query),
  );

  return rows.map((row) => ({
    device: row.device ?? "unknown",
    clicks: row._count._all,
  }));
}

export async function getUserAnalytics(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found", ErrorCodes.NOT_FOUND_USER);
  }

  return {
    total_clicks: await analyticsRepository.countClicksByUserId(userId),
  };
}

export async function getTopUrls() {
  const rows = await analyticsRepository.findTopShortUrls(5);
  return rows.map((row) => ({
    short_code: row.short_code,
    total_clicks: Number(row.total_clicks),
  }));
}
