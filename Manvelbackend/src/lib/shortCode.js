import { randomInt } from "node:crypto";

export const SHORT_CODE_LENGTH = 6;

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const ALPHABET_LENGTH = ALPHABET.length;

export function generateShortCode() {
  let out = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
    out += ALPHABET[randomInt(ALPHABET_LENGTH)];
  }
  return out;
}

function isPrismaUniqueViolation(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

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

export const DEFAULT_SHORT_CODE_MAX_ATTEMPTS = 32;

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
