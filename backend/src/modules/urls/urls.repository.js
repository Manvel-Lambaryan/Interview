import { getPrisma } from "../../config/database.js";

/**
 * @param {{
 *   user_id: string;
 *   original_url: string;
 *   short_code: string;
 *   expires_at: Date | null;
 * }} data
 */
export async function createShortUrl(data) {
  const prisma = getPrisma();
  return prisma.shortURL.create({
    data: {
      user_id: data.user_id,
      original_url: data.original_url,
      short_code: data.short_code,
      expires_at: data.expires_at,
    },
  });
}

/**
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").ShortURL | null>}
 */
export async function findByShortCode(shortCode) {
  const prisma = getPrisma();
  return prisma.shortURL.findUnique({
    where: { short_code: shortCode },
  });
}

/**
 * @param {string} userId
 * @returns {Promise<import("@prisma/client").ShortURL[]>}
 */
export async function findManyByUserId(userId) {
  const prisma = getPrisma();
  return prisma.shortURL.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
}
