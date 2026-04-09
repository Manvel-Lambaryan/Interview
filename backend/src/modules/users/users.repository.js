import { getPrisma } from "../../config/database.js";

export async function createUser(data) {
  const prisma = getPrisma();
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
    },
  });
}
