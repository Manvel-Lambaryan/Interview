/**
 * @param {import("@prisma/client").ShortURL} row
 */
export function toShortUrlResponse(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    short_code: row.short_code,
    original_url: row.original_url,
    created_at: row.created_at.toISOString(),
    expires_at: row.expires_at ? row.expires_at.toISOString() : null,
  };
}

/**
 * @param {import("@prisma/client").Tag} row
 */
export function toTagResponse(row) {
  return {
    id: row.id,
    name: row.name,
  };
}
