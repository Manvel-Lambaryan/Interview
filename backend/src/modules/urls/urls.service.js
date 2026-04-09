import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import { withUniqueShortCode } from "../../lib/shortCode.js";
import { findUserById } from "../users/users.repository.js";
import * as urlsRepository from "./urls.repository.js";

/**
 * @param {{
 *   user_id: string;
 *   original_url: string;
 *   expires_at?: string | null;
 * }} input
 */
export async function createShortUrl(input) {
  const user = await findUserById(input.user_id);
  if (!user) {
    throw new AppError(404, "User not found", ErrorCodes.NOT_FOUND_USER);
  }

  const expiresAt =
    input.expires_at === undefined
      ? null
      : input.expires_at === null
        ? null
        : new Date(input.expires_at);

  return withUniqueShortCode((shortCode) =>
    urlsRepository.createShortUrl({
      user_id: input.user_id,
      original_url: input.original_url,
      short_code: shortCode,
      expires_at: expiresAt,
    }),
  );
}

/**
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").ShortURL>}
 */
export async function getRedirectTarget(shortCode) {
  const row = await urlsRepository.findByShortCode(shortCode);
  if (!row) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }

  if (row.expires_at !== null && row.expires_at.getTime() <= Date.now()) {
    throw new AppError(
      410,
      "This short URL has expired",
      ErrorCodes.GONE_EXPIRED,
    );
  }

  return row;
}
