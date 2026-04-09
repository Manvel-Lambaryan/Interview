import { PrismaClient } from "@prisma/client";

let prisma;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Test hook: lets unit/integration tests inject a fake Prisma client
 * without opening a real database connection.
 *
 * @param {unknown} client
 */
export function setPrisma(client) {
  prisma = client;
}

export function resetPrisma() {
  prisma = undefined;
}
