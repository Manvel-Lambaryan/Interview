import { Prisma } from "@prisma/client";
import { getPrisma } from "../../config/database.js";

/**
 * @param {string} shortUrlId
 * @param {{ from?: Date; to?: Date }} range
 */
export async function countClicksByShortUrlId(shortUrlId, range = {}) {
  const prisma = getPrisma();
  return prisma.click.count({
    where: {
      short_url_id: shortUrlId,
      clicked_at: buildClickedAtFilter(range),
    },
  });
}

/**
 * @param {string} shortUrlId
 * @param {{ from?: Date; to?: Date }} range
 */
export async function countDailyClicksByShortUrlId(shortUrlId, range = {}) {
  const prisma = getPrisma();
  const clickedAtFilter = buildClickedAtFilter(range);
  const conditions = [Prisma.sql`c.short_url_id = ${shortUrlId}`];

  if (clickedAtFilter?.gte) {
    conditions.push(Prisma.sql`c.clicked_at >= ${clickedAtFilter.gte}`);
  }

  if (clickedAtFilter?.lte) {
    conditions.push(Prisma.sql`c.clicked_at <= ${clickedAtFilter.lte}`);
  }

  const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

  return prisma.$queryRaw(
    Prisma.sql`
      SELECT
        DATE(c.clicked_at) AS date,
        COUNT(*)::int AS clicks
      FROM clicks c
      ${whereClause}
      GROUP BY DATE(c.clicked_at)
      ORDER BY DATE(c.clicked_at) ASC
    `,
  );
}

/**
 * @param {string} shortUrlId
 * @param {{ from?: Date; to?: Date }} range
 */
export async function countClicksByDeviceByShortUrlId(shortUrlId, range = {}) {
  const prisma = getPrisma();
  return prisma.click.groupBy({
    by: ["device"],
    where: {
      short_url_id: shortUrlId,
      clicked_at: buildClickedAtFilter(range),
    },
    _count: {
      _all: true,
    },
    orderBy: {
      device: "asc",
    },
  });
}

/**
 * @param {string} userId
 */
export async function countClicksByUserId(userId) {
  const prisma = getPrisma();
  return prisma.click.count({
    where: {
      short_url: {
        user_id: userId,
      },
    },
  });
}

export async function findTopShortUrls(limit = 5) {
  const prisma = getPrisma();
  return prisma.$queryRaw(
    Prisma.sql`
      SELECT
        su.short_code,
        COUNT(*)::int AS total_clicks
      FROM clicks c
      INNER JOIN short_urls su
        ON su.id = c.short_url_id
      GROUP BY su.id, su.short_code
      ORDER BY COUNT(*) DESC, su.short_code ASC
      LIMIT ${limit}
    `,
  );
}

/**
 * @param {{ from?: Date; to?: Date }} range
 */
function buildClickedAtFilter(range) {
  const clickedAt = {};

  if (range.from) {
    clickedAt.gte = range.from;
  }

  if (range.to) {
    clickedAt.lte = range.to;
  }

  return Object.keys(clickedAt).length > 0 ? clickedAt : undefined;
}
