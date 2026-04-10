import * as clicksRepository from "../modules/clicks/clicks.repository.js";

/**
 * Redirect ↔ click ingestion bridge (Manvel URL module → Mane Click row).
 * Single callable entry for the same DB insert used by `GET /urls/:short_code` (no internal HTTP).
 *
 * @param {string} shortUrlId - `ShortURL.id` (UUID)
 * @param {{ ip_address: string, country?: string | null, device?: string }} metadata
 */
export async function recordClick(shortUrlId, metadata) {
  return clicksRepository.createClick({
    short_url_id: shortUrlId,
    ip_address: metadata.ip_address,
    country: metadata.country ?? null,
    device: metadata.device ?? "unknown",
  });
}
