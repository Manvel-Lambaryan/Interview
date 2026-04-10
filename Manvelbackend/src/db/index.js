/**
 * Database entry point: Prisma client singleton and test hooks live in `config/database.js`.
 * Import from here or from `config/database.js` — same behavior.
 */
export { getPrisma, resetPrisma, setPrisma } from "../config/database.js";
export { Prisma } from "@prisma/client";
