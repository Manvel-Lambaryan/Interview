import * as clicksRepository from "../modules/clicks/clicks.repository.js";


export async function recordClick(shortUrlId, metadata) {
  return clicksRepository.createClick({
    short_url_id: shortUrlId,
    ip_address: metadata.ip_address,
    country: metadata.country ?? null,
    device: metadata.device ?? "unknown",
  });
}
