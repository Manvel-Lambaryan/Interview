/**
 * PostgreSQL object names aligned with `prisma/schema.prisma` map values
 * and both task docs (users/short URLs/tags/junction + clicks/analytics).
 * Use in raw SQL ($queryRaw) to avoid typos; Prisma models use these under the hood.
 */

export const TABLES = {
  users: "users",
  short_urls: "short_urls",
  tags: "tags",
  short_url_tags: "short_url_tags",
  clicks: "clicks",
};

/** Postgres enum type for Click.device (mapped enum in schema) */
export const CLICK_DEVICE_ENUM = "click_device";
