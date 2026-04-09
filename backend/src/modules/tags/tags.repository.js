import { getPrisma } from "../../config/database.js";

/**
 * @param {string} id
 * @returns {Promise<import("@prisma/client").Tag | null>}
 */
export async function findTagById(id) {
  const prisma = getPrisma();
  return prisma.tag.findUnique({ where: { id } });
}

/**
 * Ensures a tag row exists for this label (unique `name`).
 * @param {string} name
 * @returns {Promise<import("@prisma/client").Tag>}
 */
export async function upsertTagByName(name) {
  const prisma = getPrisma();
  return prisma.tag.upsert({
    where: { name },
    create: { name },
    update: {},
  });
}

/**
 * @param {string} shortUrlId
 * @param {string} tagId
 */
export async function createShortUrlTag(shortUrlId, tagId) {
  const prisma = getPrisma();
  return prisma.shortURLTag.create({
    data: { short_url_id: shortUrlId, tag_id: tagId },
  });
}

/**
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").Tag[] | null>} `null` if short URL missing
 */
export async function findTagsByShortCode(shortCode) {
  const prisma = getPrisma();
  const row = await prisma.shortURL.findUnique({
    where: { short_code: shortCode },
    include: {
      short_url_tags: {
        orderBy: { tag: { name: "asc" } },
        include: { tag: true },
      },
    },
  });
  if (!row) {
    return null;
  }
  return row.short_url_tags.map((junction) => junction.tag);
}
