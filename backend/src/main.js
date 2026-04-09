/**
 * Process entry — env load, DB, HTTP server.
 * Structure: see ../BACKEND_FOLDER_SCHEMA.md
 */
import { env } from "./config/env.js";
import { getPrisma } from "./config/database.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Listening on http://localhost:${env.PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${env.PORT} is already in use. Stop the other process or set PORT in .env.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

function shutdown() {
  server.close(async () => {
    await getPrisma().$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
