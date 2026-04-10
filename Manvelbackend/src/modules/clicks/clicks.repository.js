import { getPrisma } from "../../config/database.js";

/**
 * Shared lookup contract for click tracking and analytics endpoints.
 * Keeping this inside the runnable backend avoids the split skeleton under `/src`.
 */
export async function findShortUrlByCode(shortCode) {
  const prisma = getPrisma();
  return prisma.shortURL.findUnique({
    where: { short_code: shortCode },
  });
}

export async function createClick(data) {
  const prisma = getPrisma();
  return prisma.click.create({
    data: {
      short_url_id: data.short_url_id,
      ip_address: data.ip_address,
      country: data.country ?? null,
      device: data.device ?? null,
    },
  });
}
