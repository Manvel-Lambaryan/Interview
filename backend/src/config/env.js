import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));

const backendEnv = resolve(__dirname, "../../.env");
const repoRootEnv = resolve(__dirname, "../../../.env");

if (existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
} else if (existsSync(repoRootEnv)) {
  dotenv.config({ path: repoRootEnv });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export const env = envSchema.parse(process.env);
