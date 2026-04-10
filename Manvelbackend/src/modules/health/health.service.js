import { getPrisma } from "../../db/index.js";

export async function pingDatabase() {
  const prisma = getPrisma();
  await prisma.$queryRaw`SELECT 1`;
}
