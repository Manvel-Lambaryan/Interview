import { getPrisma } from "../../config/database.js";

export async function findTagById(id) {
  const prisma = getPrisma();
  return prisma.tag.findUnique({ where: { id } });
}

/**
 * Ensures a tag row exists for this label (unique `name`).
 */
export async function upsertTagByName(name) {
  const prisma = getPrisma();
  return prisma.tag.upsert({
    where: { name },
    create: { name },
    update: {},
  });
}

export async function createShortUrlTag(shortUrlId, tagId) {
  const prisma = getPrisma();
  return prisma.shortURLTag.create({
    data: { short_url_id: shortUrlId, tag_id: tagId },
  });
}

/** Returns `null` if short URL missing. */
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
