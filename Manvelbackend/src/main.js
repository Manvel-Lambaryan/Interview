import { env } from "./config/env.js";
import { getPrisma } from "./config/database.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "HTTP server listening");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.fatal(
      { err, port: env.PORT },
      "Port already in use; stop the other process or set PORT in .env",
    );
  } else {
    logger.fatal({ err }, "HTTP server error");
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
