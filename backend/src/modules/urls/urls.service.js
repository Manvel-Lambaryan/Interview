import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import { withUniqueShortCode } from "../../lib/shortCode.js";
import * as tagsRepository from "../tags/tags.repository.js";
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

/**
 * @param {string} shortCode
 */
export async function deleteShortUrlByCode(shortCode) {
  const deleted = await urlsRepository.deleteByShortCode(shortCode);
  if (deleted === 0) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }
}

/**
 * Attaches a tag to a short URL. Duplicate (same tag on same URL) → 409.
 * Body: either `{ tag_name }` (find-or-create tag by name) or `{ tag_id }` (existing tag).
 *
 * @param {string} shortCode
 * @param {{ tag_name: string } | { tag_id: string }} body
 * @returns {Promise<import("@prisma/client").Tag>}
 */
export async function attachTagToShortUrl(shortCode, body) {
  const shortUrl = await urlsRepository.findByShortCode(shortCode);
  if (!shortUrl) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }

  let tag;
  if ("tag_name" in body) {
    tag = await tagsRepository.upsertTagByName(body.tag_name);
  } else {
    const found = await tagsRepository.findTagById(body.tag_id);
    if (!found) {
      throw new AppError(404, "Tag not found", ErrorCodes.NOT_FOUND_TAG);
    }
    tag = found;
  }

  try {
    await tagsRepository.createShortUrlTag(shortUrl.id, tag.id);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new AppError(
        409,
        "This tag is already attached to this short URL",
        ErrorCodes.CONFLICT_TAG_DUPLICATE,
      );
    }
    throw e;
  }

  return tag;
}

/**
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").Tag[]>}
 */
export async function listTagsForShortUrl(shortCode) {
  const tags = await tagsRepository.findTagsByShortCode(shortCode);
  if (tags === null) {
    throw new AppError(404, "Short URL not found", ErrorCodes.NOT_FOUND_URL);
  }
  return tags;
}
