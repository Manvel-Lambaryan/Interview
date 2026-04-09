import { getPrisma } from "../../config/database.js";

/**
 * Shared lookup contract for click tracking and analytics endpoints.
 * Keeping this inside the runnable backend avoids the split skeleton under `/src`.
 *
 * @param {string} shortCode
 * @returns {Promise<import("@prisma/client").ShortURL | null>}
 */
export async function findShortUrlByCode(shortCode) {
  const prisma = getPrisma();
  return prisma.shortURL.findUnique({
    where: { short_code: shortCode },
  });
}

/**
 * @param {{
 *   short_url_id: string;
 *   ip_address: string;
 *   country?: string | null;
 *   device?: import("@prisma/client").ClickDevice | null;
 * }} data
 */
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
