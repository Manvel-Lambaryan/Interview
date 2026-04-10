import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageEnv = resolve(__dirname, "../.env");
const repoRootEnv = resolve(__dirname, "../../.env");

if (existsSync(packageEnv)) {
  dotenv.config({ path: packageEnv });
} else if (existsSync(repoRootEnv)) {
  dotenv.config({ path: repoRootEnv });
} else {
  dotenv.config();
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/prisma-env.mjs <prisma args...>");
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
