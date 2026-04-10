import { randomInt } from "node:crypto";

/** Length required by product spec (README / manvel-lambaryan-backend-tasks). */
export const SHORT_CODE_LENGTH = 6;

/** Alphanumeric alphabet: a–z, A–Z, 0–9 (62 symbols). */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const ALPHABET_LENGTH = ALPHABET.length;

/**
 * Generates one random short code of SHORT_CODE_LENGTH characters.
 * Uses `crypto.randomInt` for uniform distribution (not `Math.random()`).
 */
export function generateShortCode() {
  let out = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
    out += ALPHABET[randomInt(ALPHABET_LENGTH)];
  }
  return out;
}

/**
 * Prisma unique constraint failed (https://www.prisma.io/docs/reference/api-reference/error-reference#p2002)
 */
function isPrismaUniqueViolation(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

/**
 * True when the unique violation targets `short_code` (ShortURL.short_code unique constraint).
 */
export function isShortCodeUniqueViolation(error) {
  if (!isPrismaUniqueViolation(error)) {
    return false;
  }
  const target = error.meta?.target;
  if (target === undefined) {
    return false;
  }
  const fields = Array.isArray(target) ? target : [target];
  return fields.includes("short_code");
}

/**
 * Default cap for insert retries. Collisions are extremely unlikely at 62^6 space;
 * this only bounds worst-case loops if something is wrong.
 */
export const DEFAULT_SHORT_CODE_MAX_ATTEMPTS = 32;

/**
 * Calls `attempt(shortCode)` with freshly generated codes until it resolves,
 * or `shortCode` collides with an existing row — then retries with a new code.
 * Rethrows non–short-code unique errors immediately.
 */
export async function withUniqueShortCode(attempt, options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_SHORT_CODE_MAX_ATTEMPTS;

  for (let i = 0; i < maxAttempts; i += 1) {
    const shortCode = generateShortCode();
    try {
      return await attempt(shortCode);
    } catch (error) {
      if (isShortCodeUniqueViolation(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Could not allocate a unique short_code after ${maxAttempts} attempts`
  );
}
