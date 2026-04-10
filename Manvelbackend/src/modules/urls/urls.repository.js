import { getPrisma } from "../../config/database.js";

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

export async function findByShortCode(shortCode) {
  const prisma = getPrisma();
  return prisma.shortURL.findUnique({
    where: { short_code: shortCode },
  });
}

export async function findManyByUserId(userId) {
  const prisma = getPrisma();
  return prisma.shortURL.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
}

export async function findManyByTagName(tagName) {
  const prisma = getPrisma();
  return prisma.shortURL.findMany({
    where: {
      short_url_tags: {
        some: {
          tag: { name: tagName },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function deleteByShortCode(shortCode) {
  const prisma = getPrisma();
  const result = await prisma.shortURL.deleteMany({
    where: { short_code: shortCode },
  });
  return result.count;
}
