import { getPrisma } from "../../db/index.js";

/**
 * Verifies database connectivity with a lightweight query.
 * @returns {Promise<void>}
 */
export async function pingDatabase() {
  const prisma = getPrisma();
  await prisma.$queryRaw`SELECT 1`;
}
